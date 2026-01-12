'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Play, Download, Trash2, Search, Volume2, Calendar } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AudioFile {
  id: string
  title: string
  text: string
  audioPath: string
  duration?: number
  format: string
  voiceId?: string
  speed: number
  volume: number
  createdAt: string
}

export default function AudioLibrary() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadAudioFiles()
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setPlayingId(null)
    }
  }, [])

  const loadAudioFiles = async () => {
    try {
      const response = await fetch('/api/audio-studio/audio-files')
      if (response.ok) {
        const files = await response.json()
        setAudioFiles(files)
      }
    } catch (error) {
      console.error('Failed to load audio files:', error)
    }
  }

  const handlePlay = async (file: AudioFile) => {
    if (playingId === file.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play()
        } else {
          audioRef.current.pause()
          setPlayingId(null)
        }
      }
      return
    }

    try {
      const response = await fetch(`/api/audio-studio/audio/${file.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        if (audioRef.current) {
          URL.revokeObjectURL(audioRef.current.src)
          audioRef.current.src = url
          audioRef.current.play()
          setPlayingId(file.id)
        }
      } else {
        toast({
          title: 'Playback failed',
          description: 'Unable to load audio file',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Play error:', error)
      toast({
        title: 'Playback failed',
        description: error instanceof Error ? error.message : 'An error occurred while playing audio',
        variant: 'destructive',
      })
    }
  }

  const handleDownload = async (file: AudioFile) => {
    try {
      const response = await fetch(`/api/audio-studio/audio/${file.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${file.title}-${Date.now()}.${file.format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
          title: 'Download successful',
          description: `Downloaded ${file.title}`,
        })
      }
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: 'Download failed',
        description: 'Unable to download audio file',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this audio file?')) {
      return
    }

    try {
      const response = await fetch(`/api/audio-studio/audio/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAudioFiles(audioFiles.filter((file) => file.id !== id))
        if (playingId === id) {
          setPlayingId(null)
        }
        toast({
          title: 'Deleted successfully',
          description: 'Audio file has been deleted',
        })
      } else {
        toast({
          title: 'Delete failed',
          description: 'Unable to delete audio file',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Delete failed',
        description: 'An error occurred while deleting audio file',
        variant: 'destructive',
      })
    }
  }

  const filteredFiles = audioFiles.filter((file) => {
    const matchesSearch =
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.text.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'with-voice' && file.voiceId) ||
      (filterType === 'without-voice' && !file.voiceId)

    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Hidden Audio Element */}
      <audio ref={(el) => { audioRef.current = el }} className="hidden" />

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="with-voice">With Voice Profile</SelectItem>
              <SelectItem value="without-voice">Without Voice Profile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Volume2 className="w-12 h-12 mx-auto text-muted-foreground" />
            <div className="text-lg font-medium">No Audio Files</div>
            <div className="text-sm text-muted-foreground">
              {audioFiles.length === 0
                ? 'Start generating your first audio file!'
                : 'No matching files found'}
            </div>
          </div>
        </Card>
      ) : (
        <ScrollArea className="h-[600px] rounded-md border">
          <div className="p-4 space-y-3">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{file.title}</h4>
                        <Badge variant="secondary" className="text-xs uppercase">
                          {file.format}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(file.createdAt)}
                      </div>
                    </div>
                    {file.duration && (
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(file.duration)}
                      </Badge>
                    )}
                  </div>

                  {/* Text Preview */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {file.text}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline">Speed: {file.speed.toFixed(1)}x</Badge>
                    <Badge variant="outline">Volume: {file.volume.toFixed(1)}</Badge>
                    {file.voiceId && (
                      <Badge variant="outline">Voice: {file.voiceId}</Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant={playingId === file.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePlay(file)}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {playingId === file.id ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Stats Footer */}
      {audioFiles.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <div className="text-center text-sm text-muted-foreground">
            Total {audioFiles.length} audio files
            {filteredFiles.length !== audioFiles.length && (
              <span className="ml-2">
                (Showing {filteredFiles.length})
              </span>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
