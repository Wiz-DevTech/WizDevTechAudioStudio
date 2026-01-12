'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Play, Download, Loader2, Volume2, Plus, User, Star, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, ScrollArea } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface VoiceOption {
  id: string
  name: string
  description: string
  isCustom?: boolean
}

const defaultVoices: VoiceOption[] = [
  { id: 'tongtong', name: 'TongTong', description: 'Warm and friendly' },
  { id: 'chuichui', name: 'ChuiChui', description: 'Lively and cute' },
  { id: 'xiaochen', name: 'XiaoChen', description: 'Professional and calm' },
  { id: 'jam', name: 'Jam', description: 'British gentleman' },
  { id: 'kazi', name: 'Kazi', description: 'Clear and standard' },
  { id: 'douji', name: 'Douji', description: 'Natural and fluent' },
  { id: 'luodo', name: 'LuoDo', description: 'Expressive and engaging' },
]

export default function TTSGenerator() {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('tongtong')
  const [speed, setSpeed] = useState([1.0])
  const [volume, setVolume] = useState([1.0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Custom voices state
  const [customVoices, setCustomVoices] = useState<VoiceOption[]>([])
  const [showAddVoice, setShowAddVoice] = useState(false)
  const [newVoiceName, setNewVoiceName] = useState('')
  const [newVoiceDescription, setNewVoiceDescription] = useState('')
  const [selectedBaseVoice, setSelectedBaseVoice] = useState('tongtong')

  // Load custom voices from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customVoices')
    if (saved) {
      try {
        setCustomVoices(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load custom voices:', e)
      }
    }
  }, [])

  // Combine default and custom voices
  const allVoices = [...defaultVoices, ...customVoices]

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: 'Please enter text',
        description: 'Please enter text you want to convert to speech',
        variant: 'destructive',
      })
      return
    }

    if (text.length > 1024) {
      toast({
        title: 'Text too long',
        description: 'Text length cannot exceed 1024 characters',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    setAudioUrl(null)

    try {
      const response = await fetch('/api/audio-studio/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
          speed: speed[0],
          volume: volume[0],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate speech')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      toast({
        title: 'Speech generated successfully',
        description: 'You can listen or download generated speech',
      })
    } catch (error) {
      console.error('TTS Error:', error)
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'An error occurred while generating speech',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return

    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `tts-${Date.now()}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const handleAddCustomVoice = () => {
    if (!newVoiceName.trim()) {
      toast({
        title: 'Please enter voice name',
        variant: 'destructive',
      })
      return
    }

    const newVoice: VoiceOption = {
      id: `custom-${Date.now()}`,
      name: newVoiceName.trim(),
      description: newVoiceDescription.trim() || 'Custom voice',
      isCustom: true,
    }

    const updatedCustomVoices = [...customVoices, newVoice]
    setCustomVoices(updatedCustomVoices)
    
    // Save to localStorage
    localStorage.setItem('customVoices', JSON.stringify(updatedCustomVoices))
    
    // Auto-select the new voice
    setSelectedVoice(newVoice.id)
    
    // Reset form
    setNewVoiceName('')
    setNewVoiceDescription('')
    setSelectedBaseVoice('tongtong')
    setShowAddVoice(false)
    
    toast({
      title: 'Custom voice added',
      description: `"${newVoiceName}" has been added to your voices`,
    })
  }

  const handleDeleteCustomVoice = (voiceId: string) => {
    if (!confirm('Are you sure you want to delete this custom voice?')) {
      return
    }

    const updatedCustomVoices = customVoices.filter(v => v.id !== voiceId)
    setCustomVoices(updatedCustomVoices)
    
    // Save to localStorage
    localStorage.setItem('customVoices', JSON.stringify(updatedCustomVoices))
    
    // Reset to default voice if deleted one was selected
    if (selectedVoice === voiceId) {
      setSelectedVoice('tongtong')
    }
    
    toast({
      title: 'Custom voice deleted',
    })
  }

  const handleSetAsPrimary = (voiceId: string) => {
    const voice = allVoices.find(v => v.id === voiceId)
    if (voice && voice.isCustom) {
      localStorage.setItem('primaryVoice', voiceId)
      toast({
        title: 'Primary voice set',
        description: `"${voice.name}" is now your primary voice`,
      })
    }
  }

  const getPrimaryVoiceId = () => {
    return localStorage.getItem('primaryVoice') || ''
  }

  const isPrimaryVoice = (voiceId: string) => {
    return getPrimaryVoiceId() === voiceId
  }

  const getVoiceDescription = (voiceId: string) => {
    const voice = allVoices.find(v => v.id === voiceId)
    return voice?.description || ''
  }

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div className="space-y-2">
        <Label htmlFor="tts-text">
          Enter text <span className="text-muted-foreground">({text.length}/1024)</span>
        </Label>
        <Textarea
          id="tts-text"
          placeholder="Enter text you want to convert to speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={1024}
          className="resize-none"
        />
      </div>

      {/* Voice Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="voice-select">Select Voice</Label>
          <Dialog open={showAddVoice} onOpenChange={setShowAddVoice}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Voice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add Your Voice</DialogTitle>
                <DialogDescription>
                  Add your own voice to the list. Your voice will use one of the built-in voice engines.
                  You can optionally add a detailed guide/instructions with the voice.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="voice-name-input">Voice Name *</Label>
                  <Input
                    id="voice-name-input"
                    placeholder="e.g., My Voice, Narrator"
                    value={newVoiceName}
                    onChange={(e) => setNewVoiceName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Choose Base Voice *</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {defaultVoices.map((voice) => (
                      <div
                        key={voice.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedBaseVoice === voice.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedBaseVoice(voice.id)}
                      >
                        <div className="text-sm font-medium text-center">{voice.name}</div>
                        <div className="text-xs text-muted-foreground text-center mt-1">{voice.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="voice-desc-input">
                    Description & Guide 
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Textarea
                    id="voice-desc-input"
                    placeholder="Enter a short description or paste a full guide (e.g., installation instructions, usage tips)..."
                    value={newVoiceDescription}
                    onChange={(e) => setNewVoiceDescription(e.target.value)}
                    rows={8}
                    maxLength={10000}
                    className="resize-none font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {newVoiceDescription.length} / 10000 characters
                  </div>
                </div>
              </div>
              <DialogFooter>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setShowAddVoice(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomVoice} disabled={!newVoiceName.trim()}>
                    Add Voice
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
          <SelectTrigger id="voice-select">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {/* Custom Voices Section */}
            {customVoices.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  My Voices
                </div>
                {customVoices.map((voice) => (
                  <div key={voice.id} className="relative">
                    <SelectItem value={voice.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {voice.name}
                            {isPrimaryVoice(voice.id) && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                          </div>
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {voice.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCustomVoice(voice.id)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </>
            )}

            {/* Default Voices Section */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Built-in Voices
            </div>
            {defaultVoices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                <div>
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm text-muted-foreground">{voice.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <Label htmlFor="speed-slider">
          Speed: {speed[0].toFixed(1)}x
        </Label>
        <Slider
          id="speed-slider"
          min={0.5}
          max={2.0}
          step={0.1}
          value={speed}
          onValueChange={setSpeed}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.5x (Slow)</span>
          <span>1.0x (Normal)</span>
          <span>2.0x (Fast)</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <Label htmlFor="volume-slider">
          Volume: {volume[0].toFixed(1)}
        </Label>
        <Slider
          id="volume-slider"
          min={0.1}
          max={10}
          step={0.1}
          value={volume}
          onValueChange={setVolume}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.1</span>
          <span>5.0</span>
          <span>10.0</span>
        </div>
      </div>

      {/* Set as Primary Voice (only for custom voices) */}
      {selectedVoice && customVoices.find(v => v.id === selectedVoice) && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-sm font-medium">
                  {customVoices.find(v => v.id === selectedVoice)?.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isPrimaryVoice(selectedVoice) ? 'This is your primary voice' : 'Set as primary voice'}
                </div>
              </div>
            </div>
            {/* Show description preview if it exists */}
            {getVoiceDescription(selectedVoice) && (
              <div className="text-xs text-muted-foreground mt-2 max-h-16 overflow-y-auto">
                {getVoiceDescription(selectedVoice).substring(0, 200)}
                {getVoiceDescription(selectedVoice).length > 200 && '...'}
              </div>
            )}
          </div>
          {!isPrimaryVoice(selectedVoice) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSetAsPrimary(selectedVoice)}
            >
              Set as Primary
            </Button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Generate Speech
            </>
          )}
        </Button>
      </div>

      {/* Audio Player */}
      {audioUrl && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <audio ref={audioRef} src={audioUrl} className="hidden" />
            <Button onClick={handlePlay} variant="outline" size="icon">
              <Play className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <div className="text-sm font-medium">Generated Audio</div>
              <div className="text-xs text-muted-foreground">Click play button to listen</div>
            </div>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
