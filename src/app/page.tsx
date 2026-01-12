'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Library, MessageSquare, Volume2, Waves } from 'lucide-react'
import TTSGenerator from '@/components/audio-studio/tts-generator'
import VoiceCloning from '@/components/audio-studio/voice-cloning'
import ConversationBuilder from '@/components/audio-studio/conversation-builder'
import AudioLibrary from '@/components/audio-studio/audio-library'
import { Toaster } from '@/components/ui/toaster'

export default function AudioStudio() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">WizDevTech Audio Studio</h1>
              <p className="text-sm text-muted-foreground">
                Professional AI-powered voice synthesis and cloning
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="tts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="tts" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Text to Speech</span>
              <span className="sm:hidden">TTS</span>
            </TabsTrigger>
            <TabsTrigger value="cloning" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Voice Cloning</span>
              <span className="sm:hidden">Clone</span>
            </TabsTrigger>
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Conversations</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
              <span className="sm:hidden">Files</span>
            </TabsTrigger>
          </TabsList>

          {/* Text to Speech Tab */}
          <TabsContent value="tts">
            <Card>
              <CardHeader>
                <CardTitle>Text to Speech Generator</CardTitle>
                <CardDescription>
                  Convert text into natural-sounding speech with multiple voice options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TTSGenerator />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Cloning Tab */}
          <TabsContent value="cloning">
            <Card>
              <CardHeader>
                <CardTitle>Voice Cloning Studio</CardTitle>
                <CardDescription>
                  Create custom voice profiles from reference audio files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceCloning />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversation Builder Tab */}
          <TabsContent value="conversation">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Speaker Conversations</CardTitle>
                <CardDescription>
                  Generate realistic dialogues with multiple speakers and context
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversationBuilder />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Library Tab */}
          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>Audio Library</CardTitle>
                <CardDescription>
                  Browse, play, and manage all your generated audio files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AudioLibrary />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>WizDevTech Audio Studio - Professional Voice Synthesis Platform</p>
            <p className="mt-1">Powered by z-ai-web-dev-sdk</p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}
