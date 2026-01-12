'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Play, Download, Loader2, Trash2, Plus, Volume2, User, Star } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'

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

interface VoiceProfile {
  id: string
  name: string
  voiceType: string
  description: string
}

export default function VoiceCloning() {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([
    { id: '1', name: 'Host', voiceType: 'xiaochen', description: 'Professional host voice' },
    { id: '2', name: 'Narrator', voiceType: 'tongtong', description: 'Warm and friendly narrator' },
  ])
  const [customVoices, setCustomVoices] = useState<VoiceOption[]>([])
  const [showAddVoice, setShowAddVoice] = useState(false)
  const [newVoiceName, setNewVoiceName] = useState('')
  const [newVoiceDescription, setNewVoiceDescription] = useState('')
  
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileDesc, setNewProfileDesc] = useState('')
  const [selectedVoiceType, setSelectedVoiceType] = useState('tongtong')
  const [text, setText] = useState('')
  const [speed, setSpeed] = useState([1.0])
  const [volume, setVolume] = useState([1.0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

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

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) {
      toast({
        title: 'Please enter profile name',
        variant: 'destructive',
      })
      return
    }

    const newProfile: VoiceProfile = {
      id: Date.now().toString(),
      name: newProfileName,
      voiceType: selectedVoiceType,
      description: newProfileDesc,
    }

    setProfiles([...profiles, newProfile])
    setNewProfileName('')
    setNewProfileDesc('')
    toast({
      title: 'Voice profile created successfully',
      description: `Created "${newProfileName}" voice profile`,
    })
  }

  const handleDeleteProfile = (id: string) => {
    setProfiles(profiles.filter((p) => p.id !== id))
    if (selectedProfile === id) {
      setSelectedProfile(null)
    }
    toast({
      title: 'Profile deleted',
    })
  }

  const handleGenerate = async () => {
    if (!selectedProfile) {
      toast({
        title: 'Please select a voice profile',
        description: 'Please select or create a voice profile first',
        variant: 'destructive',
      })
      return
    }

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
      const profile = profiles.find((p) => p.id === selectedProfile)
      const response = await fetch('/api/audio-studio/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: profile?.voiceType || selectedVoiceType,
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
        description: `Generated speech using profile "${profile?.name}"`,
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
    link.download = `voice-clone-${Date.now()}.wav`
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
    setSelectedVoiceType(newVoice.id)
    
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
    if (selectedVoiceType === voiceId) {
      setSelectedVoiceType('tongtong')
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
      {/* Voice Profiles Panel */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Voice Profile Manager</h3>
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
                            selectedVoiceType === voice.id ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => setSelectedVoiceType(voice.id)}
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
          <div className="space-y-3">
            {/* Create New Profile */}
            <Card className="p-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="profile-name">Profile Name</Label>
                  <Input
                    id="profile-name"
                    placeholder="e.g., Host, Narrator, Commentator"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="profile-voice">Base Voice Type</Label>
                  <Select value={selectedVoiceType} onValueChange={setSelectedVoiceType}>
                    <SelectTrigger id="profile-voice">
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
                                  <div>
                                    <div className="font-medium flex items-center gap-2">
                                      {voice.name}
                                      {isPrimaryVoice(voice.id) && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{voice.description}</div>
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
                          <div>
                            <div className="font-medium">{voice.name}</div>
                            <div className="text-sm text-muted-foreground">{voice.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="profile-desc">Description (Optional)</Label>
                  <Input
                    id="profile-desc"
                    placeholder="Describe use of this voice profile"
                    value={newProfileDesc}
                    onChange={(e) => setNewProfileDesc(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateProfile} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              </div>
            </Card>

            {/* Profile List */}
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4 space-y-2">
                {profiles.map((profile) => (
                  <Card
                    key={profile.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedProfile === profile.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedProfile(profile.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{profile.name}</div>
                          <Badge variant="secondary" className="text-xs">
                            {allVoices.find((v) => v.id === profile.voiceType)?.name}
                          </Badge>
                        </div>
                        {profile.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {profile.description}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProfile(profile.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {profiles.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No voice profiles yet, please create one
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Test & Generate Panel */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-3">Test & Generate</h3>
        <Card className="p-4 space-y-4">
          {/* Selected Profile Info */}
          {selectedProfile && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-sm font-medium">Current Profile</div>
              <div className="text-lg font-semibold mt-1">
                {profiles.find((p) => p.id === selectedProfile)?.name}
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor="clone-text">
              Enter text <span className="text-muted-foreground">({text.length}/1024)</span>
            </Label>
            <Textarea
              id="clone-text"
              placeholder="Enter text to test..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={1024}
              className="resize-none"
            />
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <Label htmlFor="speed-slider-clone">
              Speed: {speed[0].toFixed(1)}x
            </Label>
            <Slider
              id="speed-slider-clone"
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
            <Label htmlFor="volume-slider-clone">
              Volume: {volume[0].toFixed(1)}
            </Label>
            <Slider
              id="volume-slider-clone"
              min={0.1}
              max={10}
              step={0.1}
              value={volume}
              onValueChange={setVolume}
              className="w-full"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedProfile || !text.trim()}
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
                Generate Speech
              </>
            )}
          </Button>

          {/* Audio Player */}
          {audioUrl && (
            <Card className="p-3">
              <div className="flex items-center gap-3">
                <audio ref={audioRef} src={audioUrl} className="hidden" />
                <Button onClick={handlePlay} variant="outline" size="icon">
                  <Play className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <div className="text-sm font-medium">Generated Audio</div>
                  <div className="text-xs text-muted-foreground">Generated with voice profile</div>
                </div>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </Card>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-2">About Voice Profiles</h4>
          <p className="text-sm text-muted-foreground">
            Voice profiles allow you to create personalized voice settings. Select a base voice type and name your profile,
            then quickly use your personalized settings when generating speech. This is similar to voice cloning effects,
            allowing you to create exclusive voice styles for different scenarios.
          </p>
        </Card>
      </div>
    </div>
  )
}
