import React from 'react'

type PolicySection = {
  title: string
  paragraphs?: string[]
  bullets?: { label: string; body: string }[]
  list?: string[]
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    title: 'Information We Collect',
    bullets: [
      {
        label: 'Personal Data',
        body: 'Email addresses and billing metadata collected during signup or subscription management to authenticate you, communicate about the service, and manage access.',
      },
      {
        label: 'User Content',
        body: 'Goals, habits, YouTube URLs, and text inputs necessary to generate AI-powered habit blueprints.',
      },
      {
        label: 'Non-Personal Data',
        body: 'Cookies, IP addresses, and device data used for security, fraud prevention, analytics, and product improvement.',
      },
    ],
  },
  {
    title: 'Use of Information',
    bullets: [
      {
        label: 'Personal Data',
        body: 'Enables account provisioning, service-related messaging, and subscription fulfillment.',
      },
      {
        label: 'User Content',
        body: 'Processed via Google Gemini AI solely to create personalized habit blueprints. Aggregated and anonymized insights may be used to improve output quality.',
      },
      {
        label: 'Non-Personal Data',
        body: 'Supports authentication workflows, guards against abuse, and informs analytics so we can improve performance.',
      },
    ],
  },
  {
    title: 'Sharing of Data',
    paragraphs: [
      'We never sell or trade your personal data. Information is shared only with essential processors or when required to comply with legal obligations.',
    ],
    list: [
      'Google Gemini AI – processes submitted content to generate blueprints.',
      'Supabase – provides authentication, database, and storage services.',
      'Payment processors – manage subscription payments; Consum does not store full payment details.',
    ],
  },
  {
    title: 'Cookies',
    paragraphs: [
      'Session cookies maintain authentication, enhance security, and support basic analytics. Disabling cookies in your browser may limit access to certain features.',
    ],
  },
  {
    title: 'Security',
    paragraphs: [
      'We apply reasonable safeguards to protect personal data and user content from unauthorized access, disclosure, or misuse. No internet transmission is completely secure, so residual risk remains.',
    ],
  },
  {
    title: 'User Rights',
    paragraphs: [
      'Request access, correction, or deletion of your personal data at any time by contacting privacy@consum.app. You can also delete your account from settings and export blueprint data for portability.',
    ],
  },
  {
    title: 'Data Retention',
    paragraphs: [
      'We retain data while your account remains active. Deleted accounts are purged within 30 days. If you do not subscribe after a free trial, we remove your data within a few days of the trial ending.',
    ],
  },
  {
    title: 'Updates to This Policy',
    paragraphs: [
      'We may revise this Privacy Policy over time and will notify you via email of significant changes. Continued use after updates indicates acceptance.',
    ],
  },
  {
    title: 'Governing Law & Contact',
    paragraphs: [
      'This Privacy Policy is governed by the laws of Poland. Direct privacy questions to privacy@consum.app.',
    ],
  },
]

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-4 rounded-3xl border border-border/50 bg-card/80 p-8">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary">Privacy Policy</p>
            <h1 className="mt-2 text-3xl font-semibold">Privacy Policy for Consum</h1>
          </div>
          <dl className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-foreground">Effective Date</dt>
              <dd>December 2, 2025</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Data Controller</dt>
              <dd>Jakub Szewczyk</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Contact</dt>
              <dd>privacy@consum.app</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Service URL</dt>
              <dd>https://consum.app</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">
            This policy explains how Consum collects, uses, and protects your information when you interact with the platform.
          </p>
        </header>

        <div className="space-y-12">
          {POLICY_SECTIONS.map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-base text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <dl className="space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
                  {section.bullets.map((bullet) => (
                    <div key={bullet.label}>
                      <dt className="font-semibold text-foreground">{bullet.label}</dt>
                      <dd className="text-sm text-muted-foreground">{bullet.body}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {section.list && (
                <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
