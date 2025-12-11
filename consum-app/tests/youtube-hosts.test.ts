import test from 'node:test'
import assert from 'node:assert/strict'

import { extractYouTubeVideoId, isTrustedYouTubeHost, isValidYouTubeUrl } from '../src/lib/youtube.js'

const VIDEO_ID = 'dQw4w9WgXcQ'

test('extracts IDs from trusted YouTube hosts', () => {
  const validUrls = [
    `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    `https://m.youtube.com/watch?v=${VIDEO_ID}&t=42s`,
    `https://music.youtube.com/watch?v=${VIDEO_ID}`,
    `https://youtu.be/${VIDEO_ID}?si=12345`,
    `www.youtube.com/watch?v=${VIDEO_ID}`
  ]

  for (const url of validUrls) {
    assert.strictEqual(
      extractYouTubeVideoId(url),
      VIDEO_ID,
      `expected ${url} to yield a video ID`
    )
    assert.ok(isValidYouTubeUrl(url), `expected ${url} to be considered valid`)
  }
})

test('rejects URLs from attacker-controlled hosts', () => {
  const maliciousUrls = [
    `https://youtube.com.attacker.com/watch?v=${VIDEO_ID}`,
    `https://attacker.com/https://youtube.com/watch?v=${VIDEO_ID}`,
    `https://www.youtu.be.evil/${VIDEO_ID}`,
    `https://example.com/?redirect=https://youtu.be/${VIDEO_ID}`
  ]

  for (const url of maliciousUrls) {
    assert.strictEqual(
      extractYouTubeVideoId(url),
      null,
      `expected ${url} to be rejected`
    )
    assert.ok(!isValidYouTubeUrl(url), `expected ${url} to be invalid`)
  }
})

test('trusted hostname helper only allows canonical hosts', () => {
  const trusted = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'studio.youtube.com', 'youtu.be']
  const untrusted = ['youtube.com.attacker.com', 'attacker.youtube.com.evil', 'example.com', 'youtu.be.bad']

  for (const host of trusted) {
    assert.ok(isTrustedYouTubeHost(host), `expected ${host} to be trusted`)
  }

  for (const host of untrusted) {
    assert.ok(!isTrustedYouTubeHost(host), `expected ${host} to be untrusted`)
  }
})
