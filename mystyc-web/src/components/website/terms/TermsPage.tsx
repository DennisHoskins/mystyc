import WebsiteTransition from '@/components/ui/transition/WebsiteTransition';
import Heading from '@/components/ui/Heading';
import WebsiteFooter from '../WebsiteFooter';
import Text from '@/components/ui/Text';
import ScrollWrapper from '@/components/ui/layout/scroll/ScrollWrapper';

export default function TermsPage() {
  return (
    <WebsiteTransition>
      <div className='flex-1 flex flex-col w-full h-full overflow-hidden -mt-[59px]'>
        <ScrollWrapper className='z-10'>
          <div className='flex flex-col flex-1 w-full min-h-fit items-center relative z-10'>
            <Heading level={1} className='mt-20 mb-8'>Terms of Use</Heading>        
            
            <div className='max-w-4xl mx-auto px-6 space-y-8 mb-16'>
              <Text variant='small' className='text-center'>Last updated: September 15, 2025</Text>
              
              <div className='space-y-6'>
                <Heading level={2}>Acceptance of Terms</Heading>
                <Text variant='body'>
                  By accessing and using mystyc (&apos;Service&apos;, &apos;we&apos;, &apos;us&apos;, or &apos;our&apos;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these Terms of Use, do not use this service.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Description of Service</Heading>
                <Text variant='body'>
                  mystyc provides astrological chart generation, interpretations, and related content based on birth information you provide. Our service is for entertainment and personal insight purposes only.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>User Accounts</Heading>
                <Text variant='body'>
                  You may need to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access to your account.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Acceptable Use</Heading>
                <Text variant='body'>You agree not to use the Service to:</Text>
                
                <div className='ml-4 space-y-2'>
                  <Text variant='body'>• Violate any applicable laws or regulations</Text>
                  <Text variant='body'>• Impersonate any person or entity or misrepresent your affiliation with any person or entity</Text>
                  <Text variant='body'>• Upload or transmit any harmful, threatening, abusive, or offensive content</Text>
                  <Text variant='body'>• Attempt to gain unauthorized access to our systems or other users&apos; accounts</Text>
                  <Text variant='body'>• Use automated scripts, bots, or other tools to access the Service</Text>
                  <Text variant='body'>• Reverse engineer, decompile, or attempt to extract source code from our Service</Text>
                  <Text variant='body'>• Use the Service for any commercial purpose without our written consent</Text>
                </div>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Intellectual Property</Heading>
                <Text variant='body'>
                  All content, features, and functionality of the Service, including but not limited to text, graphics, logos, charts, interpretations, and software, are owned by mystyc or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                </Text>
                <Text variant='body'>
                  You may use the Service for personal, non-commercial purposes only. You may not reproduce, distribute, modify, or create derivative works from any content provided by the Service without our express written permission.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Payment Terms</Heading>
                <Text variant='body'>
                  Certain features of the Service may require payment. All fees are charged in advance and are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time with reasonable notice.
                </Text>
                <Text variant='body'>
                  Payments are processed through third-party payment processors. By making a payment, you agree to the terms and conditions of our payment processors.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Disclaimer of Warranties</Heading>
                <Text variant='body'>
                  THE SERVICE IS PROVIDED &apos;AS IS&apos; AND &apos;AS AVAILABLE&apos; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. WE SPECIFICALLY DISCLAIM ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </Text>
                <Text variant='body'>
                  <strong>IMPORTANT:</strong> Astrological content provided by our Service is for entertainment and personal insight purposes only. It should not be considered as professional advice (medical, legal, financial, or otherwise). We make no representations about the accuracy or reliability of astrological interpretations.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Limitation of Liability</Heading>
                <Text variant='body'>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL MYSTYC BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Indemnification</Heading>
                <Text variant='body'>
                  You agree to defend, indemnify, and hold harmless mystyc and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Termination</Heading>
                <Text variant='body'>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms of Use.
                </Text>
                <Text variant='body'>
                  You may terminate your account at any time by contacting us or through your account settings if available.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Privacy</Heading>
                <Text variant='body'>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Changes to Terms</Heading>
                <Text variant='body'>
                  We reserve the right to modify these Terms of Use at any time. We will notify you of any changes by posting the new Terms on this page and updating the &apos;Last updated&apos; date. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Governing Law</Heading>
                <Text variant='body'>
                  These Terms shall be governed by and construed in accordance with the laws of Canada, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Canada.
                </Text>
              </div>

              <div className='space-y-6'>
                <Heading level={2}>Severability</Heading>
                <Text variant='body'>
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                </Text>
              </div>
            </div>
          </div>
          <WebsiteFooter />
        </ScrollWrapper>
      </div>
    </WebsiteTransition>
  )
}