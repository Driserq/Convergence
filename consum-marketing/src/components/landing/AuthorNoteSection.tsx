'use client'

import React from 'react'
import Image from 'next/image'
import { Quote } from 'lucide-react'

type AuthorNoteSectionProps = {
  appUrl?: string
}

export const AuthorNoteSection: React.FC<AuthorNoteSectionProps> = () => {
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight md:text-4xl">Note from author</h2>
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 shadow-lg md:p-12">
          
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          
          <div className="relative flex flex-col gap-10 md:flex-row md:items-start md:gap-12">
            
            {/* Avatar Column */}
            <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
              <div className="relative size-32 shrink-0 overflow-hidden rounded-full border-4 border-background shadow-xl ring-1 ring-border/50">
                <Image
                  src="/consum_profile.jpeg"
                  alt="Author Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-foreground">Jakub</p>
                <p className="text-sm text-muted-foreground">Founder</p>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 space-y-6">
              <Quote className="size-8 text-primary/40" />
              
              <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  I got this idea because every time I went to YouTube to find a specific video, 
                  I found myself adding at least 2 videos to my ‘Watch Later’ playlist until it 
                  grew to over 4300 videos. Yeah, beyond saving at this point.
                </p>
                <p>
                  So I made this app to help me take those videos I’m finding and make it as easy 
                  as possible to implement into my life and routine, basically self improvement on autopilot.
                </p>
                <p>
                  Hopefully you’ll find it as impactful as I do. Give the free trial a spin and 
                  let me know what would make it better for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
