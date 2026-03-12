import { useStore } from '@tanstack/react-store'
import { GlobeIcon, SettingsIcon as PreferencesIcon } from 'lucide-react'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { i18n } from '@/i18n'
import { localeStore } from '@/stores/locale'

export default function PreferencesRoute() {
  const locale = useStore(localeStore, state => state)

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
    </div>
  )
}
