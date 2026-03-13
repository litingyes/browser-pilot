import { useStore } from '@tanstack/react-store'
import { GlobeIcon, SettingsIcon as PreferencesIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { i18n } from '@/i18n'
import { DEFAULT_BROWSER_USE_POLICY, getBrowserUsePolicy, saveBrowserUsePolicy } from '@/lib/browser-use-policy'
import { localeStore } from '@/stores/locale'

function listToTextarea(value: string[]) {
  return value.join('\n')
}

function textareaToList(value: string) {
  return [...new Set(value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean))]
}

export default function PreferencesRoute() {
  const locale = useStore(localeStore, state => state)
  const [loadingPolicy, setLoadingPolicy] = useState(true)
  const [savingPolicy, setSavingPolicy] = useState(false)
  const [blockMethodPrefixesText, setBlockMethodPrefixesText] = useState(listToTextarea(DEFAULT_BROWSER_USE_POLICY.blockMethodPrefixes))
  const [blockMethodsText, setBlockMethodsText] = useState(listToTextarea(DEFAULT_BROWSER_USE_POLICY.blockMethods))
  const [blockTabUrlPrefixesText, setBlockTabUrlPrefixesText] = useState(listToTextarea(DEFAULT_BROWSER_USE_POLICY.blockTabUrlPrefixes))
  const [allowedNavigateProtocolsText, setAllowedNavigateProtocolsText] = useState(listToTextarea(DEFAULT_BROWSER_USE_POLICY.allowedNavigateProtocols))
  const [requireConfirmationForSendCdp, setRequireConfirmationForSendCdp] = useState(DEFAULT_BROWSER_USE_POLICY.requireConfirmationForSendCdp)
  const [allowAgentTabIdOverride, setAllowAgentTabIdOverride] = useState(DEFAULT_BROWSER_USE_POLICY.allowAgentTabIdOverride)

  useEffect(() => {
    getBrowserUsePolicy()
      .then((policy) => {
        setBlockMethodPrefixesText(listToTextarea(policy.blockMethodPrefixes))
        setBlockMethodsText(listToTextarea(policy.blockMethods))
        setBlockTabUrlPrefixesText(listToTextarea(policy.blockTabUrlPrefixes))
        setAllowedNavigateProtocolsText(listToTextarea(policy.allowedNavigateProtocols))
        setRequireConfirmationForSendCdp(policy.requireConfirmationForSendCdp)
        setAllowAgentTabIdOverride(policy.allowAgentTabIdOverride)
      })
      .finally(() => {
        setLoadingPolicy(false)
      })
  }, [])

  const disablePolicyActions = useMemo(() => loadingPolicy || savingPolicy, [loadingPolicy, savingPolicy])

  const handleSaveBrowserUsePolicy = async () => {
    setSavingPolicy(true)

    try {
      await saveBrowserUsePolicy({
        blockMethodPrefixes: textareaToList(blockMethodPrefixesText),
        blockMethods: textareaToList(blockMethodsText),
        blockTabUrlPrefixes: textareaToList(blockTabUrlPrefixesText),
        allowedNavigateProtocols: textareaToList(allowedNavigateProtocolsText),
        requireConfirmationForSendCdp,
        allowAgentTabIdOverride,
      })
      toast.success(i18n.t('preferences.browserUsePolicySaved'))
    }
    finally {
      setSavingPolicy(false)
    }
  }

  return (
    <div className="px-2 py-4 w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl flex items-center gap-2 text-accent-foreground">
          <PreferencesIcon className="size-6" />
          {i18n.t('preferences.title')}
        </h1>
      </div>

      <div className="mt-6 rounded-md border p-4">
        <Field orientation="horizontal" className="items-start">
          <FieldContent className="max-w-md">
            <FieldLabel className="font-medium">
              <GlobeIcon className="size-4" />
              {i18n.t('preferences.language')}
            </FieldLabel>
            <FieldDescription>
              {i18n.t('preferences.languageDescription')}
            </FieldDescription>
          </FieldContent>
          <div className="w-full max-w-60 flex justify-end">
            <Select
              value={locale}
              onValueChange={(value) => {
                localeStore.setState(() => value === 'zh-CN' ? 'zh-CN' : 'en-US')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">{i18n.t('preferences.languageOptionEnglish')}</SelectItem>
                <SelectItem value="zh-CN">{i18n.t('preferences.languageOptionChinese')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Field>
      </div>

      <div className="mt-6 rounded-md border p-4">
        <div className="flex flex-col gap-1 mb-4">
          <h2 className="text-base font-medium">{i18n.t('preferences.browserUsePolicyTitle')}</h2>
          <p className="text-sm text-muted-foreground">{i18n.t('preferences.browserUsePolicyDescription')}</p>
        </div>
        <div className="space-y-4">
          <Field orientation="horizontal" className="items-start">
            <FieldContent className="max-w-md">
              <FieldLabel className="font-medium">{i18n.t('preferences.requireConfirmationForSendCdp')}</FieldLabel>
              <FieldDescription>{i18n.t('preferences.requireConfirmationForSendCdpDescription')}</FieldDescription>
            </FieldContent>
            <div className="w-full max-w-60 flex justify-end">
              <Switch checked={requireConfirmationForSendCdp} disabled={disablePolicyActions} onCheckedChange={setRequireConfirmationForSendCdp} />
            </div>
          </Field>

          <Field orientation="horizontal" className="items-start">
            <FieldContent className="max-w-md">
              <FieldLabel className="font-medium">{i18n.t('preferences.allowAgentTabIdOverride')}</FieldLabel>
              <FieldDescription>{i18n.t('preferences.allowAgentTabIdOverrideDescription')}</FieldDescription>
            </FieldContent>
            <div className="w-full max-w-60 flex justify-end">
              <Switch checked={allowAgentTabIdOverride} disabled={disablePolicyActions} onCheckedChange={setAllowAgentTabIdOverride} />
            </div>
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel className="font-medium">{i18n.t('preferences.blockMethodPrefixes')}</FieldLabel>
              <FieldDescription>{i18n.t('preferences.blockMethodPrefixesDescription')}</FieldDescription>
            </FieldContent>
            <Textarea rows={5} value={blockMethodPrefixesText} disabled={disablePolicyActions} onChange={event => setBlockMethodPrefixesText(event.target.value)} />
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel className="font-medium">{i18n.t('preferences.blockMethods')}</FieldLabel>
              <FieldDescription>{i18n.t('preferences.blockMethodsDescription')}</FieldDescription>
            </FieldContent>
            <Textarea rows={6} value={blockMethodsText} disabled={disablePolicyActions} onChange={event => setBlockMethodsText(event.target.value)} />
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel className="font-medium">{i18n.t('preferences.blockTabUrlPrefixes')}</FieldLabel>
              <FieldDescription>{i18n.t('preferences.blockTabUrlPrefixesDescription')}</FieldDescription>
            </FieldContent>
            <Textarea rows={4} value={blockTabUrlPrefixesText} disabled={disablePolicyActions} onChange={event => setBlockTabUrlPrefixesText(event.target.value)} />
          </Field>

          <Field>
            <FieldContent>
              <FieldLabel className="font-medium">{i18n.t('preferences.allowedNavigateProtocols')}</FieldLabel>
              <FieldDescription>{i18n.t('preferences.allowedNavigateProtocolsDescription')}</FieldDescription>
            </FieldContent>
            <Textarea rows={3} value={allowedNavigateProtocolsText} disabled={disablePolicyActions} onChange={event => setAllowedNavigateProtocolsText(event.target.value)} />
          </Field>

          <div className="flex justify-end">
            <Button type="button" disabled={disablePolicyActions} onClick={handleSaveBrowserUsePolicy}>
              {savingPolicy ? i18n.t('common.processing') : i18n.t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
