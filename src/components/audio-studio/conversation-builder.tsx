'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Play, Download, Loader2, Plus, Trash2, Volume2, MessageSquare, User, Star } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'

interface VoiceOption {
  id: string
  name: string
  description: string
  color: string
  isCustom?: boolean
}

const defaultVoices: VoiceOption[] = [
  { id: 'tongtong', name: 'TongTong', description: 'Warm and friendly', color: 'bg-emerald-500' },
  { id: 'chuichui', name: 'ChuiChui', description: 'Lively and cute', color: 'bg-pink-500' },
  { id: 'xiaochen', name: 'XiaoChen', description: 'Professional and calm', color: 'bg-blue-500' },
  { id: 'jam', name: 'Jam', description: 'British gentleman', color: 'bg-purple-500' },
  { id: 'kazi', name: 'Kazi', description: 'Clear and standard', color: 'bg-orange-500' },
  { id: 'douji', name: 'Douji', description: 'Natural and fluent', color: 'bg-cyan-500' },
  { id: 'luodo', name: 'LuoDo', description: 'Expressive and engaging', color: 'bg-red-500' },
]

interface ConversationLine {
  id: string
  speaker: string
  text: string
}

export default function ConversationBuilder() {
  const [conversationTitle, setConversationTitle] = useState('')
  const [lines, setLines] = useState<ConversationLine[]>([])
  const [newLineSpeaker, setNewLineSpeaker] = useState('tongtong')
  const [newLineText, setNewLineText] = useState('')
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

  const handleAddLine = () => {
    if (!newLineText.trim()) {
      toast({
        title: 'Please enter dialogue content',
        variant: 'destructive',
      })
      return
    }

    const newLine: ConversationLine = {
      id: Date.now().toString(),
      speaker: newLineSpeaker,
      text: newLineText.trim(),
    }

    setLines([...lines, newLine])
    setNewLineText('')
    toast({
      title: 'Dialogue line added',
    })
  }

  const handleDeleteLine = (id: string) => {
    setLines(lines.filter((line) => line.id !== id))
  }

  const handleClearAll = () => {
    setLines([])
    setConversationTitle('')
    setAudioUrl(null)
  }

  const handleGenerate = async () => {
    if (lines.length === 0) {
      toast({
        title: 'Please add dialogue content',
        description: 'Conversation needs at least one line',
        variant: 'destructive',
      })
      return
    }

    const totalLength = lines.reduce((sum, line) => sum + line.text.length, 0)
    if (totalLength > 1024) {
      toast({
        title: 'Dialogue content too long',
        description: 'Total dialogue length cannot exceed 1024 characters',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    setAudioUrl(null)

    try {
      const concatenatedText = lines
        .map((line) => {
          const speaker = allVoices.find((v) => v.id === line.speaker)
          return `[${speaker?.name || 'Speaker'}]: ${line.text}`
        })
        .join('\n')

      const firstSpeaker = lines[0].speaker
      const response = await fetch('/api/audio-studio/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: concatenatedText,
          voice: firstSpeaker,
          speed: speed[0],
          volume: volume[0],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate dialogue')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      toast({
        title: 'Dialogue generated successfully',
        description: `Generated audio with ${lines.length} dialogue lines`,
      })
    } catch (error) {
      console.error('Conversation Error:', error)
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'An error occurred while generating dialogue',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return

    const title = conversationTitle || 'conversation'
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${title}-${Date.now()}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const handleLoadSample = () => {
    setConversationTitle('AI Assistant Dialogue Example')
    setLines([
      { id: '1', speaker: 'xiaochen', text: 'Hello, how can I help you today?' },
      { id: '2', speaker: 'tongtong', text: 'I would like to learn more about artificial intelligence.' },
      { id: '3', speaker: 'xiaochen', text: 'AI is a broad topic including machine learning, deep learning, and more.' },
      { id: '4', speaker: 'tongtong', text: 'Can you give me a brief introduction?' },
      { id: '5', speaker: 'xiaochen', text: 'Of course! Machine learning is a technology that enables computers to learn patterns from data.' },
    ])
    toast({
      title: 'Sample dialogue loaded',
    })
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
      color: 'bg-indigo-500',
      isCustom: true,
    }

    const updatedCustomVoices = [...customVoices, newVoice]
    setCustomVoices(updatedCustomVoices)
    
    // Save to localStorage
    localStorage.setItem('customVoices', JSON.stringify(updatedCustomVoices))
    
    // Auto-select the new voice
    setNewLineSpeaker(newVoice.id)
    
    // Reset form
    setNewVoiceName('')
    setNewVoiceDescription('')
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
    if (newLineSpeaker === voiceId) {
      setNewLineSpeaker('tongtong')
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

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Conversation Editor Panel */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Conversation Editor</h3>
            <Dialog open={showAddVoice} onOpenChange={setShowAddVoice}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add My Voice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Your Voice</DialogTitle>
                  <DialogDescription>
                    Add your own voice to the list. This voice will use one of the built-in voice engines.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="voice-name-input">Voice Name</Label>
                    <Input
                      id="voice-name-input"
                      placeholder="e.g., My Voice, Narrator"
                      value={newVoiceName}
                      onChange={(e) => setNewVoiceName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="voice-desc-input">Description (Optional)</Label>
                    <Input
                      id="voice-desc-input"
                      placeholder="e.g., Soft and calm, Energetic and clear"
                      value={newVoiceDescription}
                      onChange={(e) => setNewVoiceDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Choose Base Voice</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {defaultVoices.map((voice) => (
                        <div
                          key={voice.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            newLineSpeaker === voice.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setNewLineSpeaker(voice.id)}
                        >
                          <div className="text-sm font-medium">{voice.name}</div>
                          <div className="text-xs text-muted-foreground">{voice.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddVoice(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomVoice} disabled={!newVoiceName.trim()}>
                    Add Voice
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="p-4 space-y-4">
            {/* Conversation Title */}
            <div>
              <Label htmlFor="conversation-title">Conversation Title</Label>
              <Input
                id="conversation-title"
                placeholder="e.g., Customer Service, Tutorial Narration"
                value={conversationTitle}
                onChange={(e) => setConversationTitle(e.target.value)}
              />
            </div>

            <Separator />

            {/* Add New Line */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Add Dialogue Line
              </div>
              <div>
                <Label htmlFor="line-speaker">Speaker</Label>
                <Select value={newLineSpeaker} onValueChange={setNewLineSpeaker}>
                  <SelectTrigger id="line-speaker">
                    <SelectValue placeholder="Select speaker" />
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
                                <div className={`w-2 h-2 rounded-full ${voice.color}`} />
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {voice.name}
                                    {isPrimaryVoice(voice.id) && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{voice.description}</div>
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
                              ×
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
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${voice.color}`} />
                          <div>
                            <div className="font-medium">{voice.name}</div>
                            <div className="text-xs text-muted-foreground">{voice.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="line-text">
                  Dialogue Content <span className="text-muted-foreground">({newLineText.length}/1024)</span>
                </Label>
                <Textarea
                  id="line-text"
                  placeholder="Enter dialogue content..."
                  value={newLineText}
                  onChange={(e) => setNewLineText(e.target.value)}
                  rows={2}
                  maxLength={1024}
                  className="resize-none"
                />
              </div>
              <Button onClick={handleAddLine} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add to Conversation
              </Button>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLoadSample} className="flex-1">
                Load Sample
              </Button>
              <Button variant="outline" onClick={handleClearAll} className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </Card>

          {/* Conversation Lines */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Conversation Preview ({lines.length} lines)</div>
              <Badge variant="secondary">{lines.reduce((sum, line) => sum + line.text.length, 0)} characters</Badge>
            </div>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-3 space-y-2">
                {lines.map((line, index) => {
                  const voice = allVoices.find((v) => v.id === line.speaker)
                  return (
                    <div key={line.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${voice?.color}`} />
                            <span className="text-sm font-medium">{voice?.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                          </div>
                          <p className="text-sm">{line.text}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLine(line.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {lines.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No dialogue content yet, please add dialogue lines
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Generation Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Generation Settings</h3>
        <Card className="p-4 space-y-4">
          {/* Info Card */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium">Conversation Statistics</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Lines:</span>{' '}
                <span className="font-medium">{lines.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Speakers:</span>{' '}
                <span className="font-medium">{[...new Set(lines.map(l => l.speaker))].length}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Total Characters:</span>{' '}
                <span className="font-medium">{lines.reduce((sum, line) => sum + line.text.length, 0)}</span>
              </div>
            </div>
          </div>

          {/* Speaker Distribution */}
          {lines.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Speaker Distribution</div>
              <div className="space-y-2">
                {[...new Set(lines.map(l => l.speaker))].map(speakerId => {
                  const speakerLines = lines.filter(l => l.speaker === speakerId)
                  const voice = allVoices.find(v => v.id === speakerId)
                  return (
                    <div key={speakerId} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${voice?.color}`} />
                      <span className="flex-1">{voice?.name}</span>
                      <Badge variant="secondary">{speakerLines.length} lines</Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Speed Control */}
          <div className="space-y-2">
            <Label htmlFor="speed-slider-conv">
              Speed: {speed[0].toFixed(1)}x
            </Label>
            <Slider
              id="speed-slider-conv"
              min={0.5}
              max={2.0}
              step={0.1}
              value={speed}
              onValueChange={setSpeed}
              className="w-full"
            />
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <Label htmlFor="volume-slider-conv">
              Volume: {volume[0].toFixed(1)}
            </Label>
            <Slider
              id="volume-slider-conv"
              min={0.1}
              max={10}
              step={0.1}
              value={volume}
              onValueChange={setVolume}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || lines.length === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Generate Dialogue Audio
              </>
            )}
          </Button>

          {/* Audio Player */}
          {audioUrl && (
            <>
              <Separator />
              <Card className="p-3">
                <div className="flex items-center gap-3">
                  <audio ref={audioRef} src={audioUrl} className="hidden" />
                  <Button onClick={handlePlay} variant="outline" size="icon">
                    <Play className="w-4 h-4" />
                  </Button>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Generated Dialogue Audio</div>
                    <div className="text-xs text-muted-foreground">
                      {lines.length} dialogue lines
                    </div>
                  </div>
                  <Button onClick={handleDownload} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </Card>
            </>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-2">About Multi-Speaker Dialogue</h4>
          <p className="text-sm text-muted-foreground">
            Create natural conversations with multiple speakers. Add dialogue lines from different speakers,
            and the system generates complete audio with all dialogue lines. Suitable for podcasts,
            tutorials, customer service dialogues, and other multi-scenario applications.
          </p>
        </Card>
      </div>
    </div>
  )
}
