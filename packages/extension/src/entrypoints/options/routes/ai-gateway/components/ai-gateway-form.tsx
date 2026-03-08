import type { AiGateway } from '@/hooks/use-ai-gateway'
import { useForm, useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { Fragment } from 'react/jsx-runtime'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue } from '@/components/ui/combobox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { aiGatewaySchema, useAiGateway } from '@/hooks/use-ai-gateway'

interface AiGatewayFormProps {
  defaultValue?: AiGateway
  onUpdated?: (aiGateway: AiGateway) => void
}

export default function AiGatewayForm(
  { defaultValue, onUpdated }: AiGatewayFormProps,
) {
  const isAdd = useMemo(() => !defaultValue, [defaultValue])

  const { aiGateways, addAiGateway, updateAiGateway } = useAiGateway()

  const form = useForm({
    defaultValues: defaultValue ?? {
      provider: 'openai-compatible' as AiGateway['provider'],
      apiKey: '',
      baseURL: '',
      models: [],
    },
    validators: {
      onSubmit: aiGatewaySchema,
    },
    onSubmit: async ({ value }) => {
      if (isAdd) {
        addAiGateway(value)
        toast.success(`AI Gateway ${value.provider} added`)
      }
      else {
        updateAiGateway(value)
        toast.success(`AI Gateway ${value.provider} updated`)
      }

      onUpdated?.(value)
    },
  })

  const provider = useStore(form.store, state => state.values.provider)
  const apiKey = useStore(form.store, state => state.values.apiKey)
  const customBaseURL = useStore(form.store, state => state.values.baseURL)
  const baseURL = useMemo(() => {
    if (customBaseURL) {
      return customBaseURL
    }

    if (provider === 'openai') {
      return 'https://api.openai.com/v1'
    }
    else if (provider === 'openrouter') {
      return 'https://openrouter.ai/api/v1/models'
    }
    else if (provider === 'anthropic') {
      return 'https://api.anthropic.com/v1'
    }
    else if (provider === 'deepseek') {
      return 'https://api.deepseek.com/v1'
    }
  }, [customBaseURL, provider])

  const { data: models } = useQuery({
    queryKey: ['ai-gateway', baseURL, apiKey],
    queryFn: () => fetch(`${baseURL}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }).then(res => res.json()).then(data => data?.data?.map((model: { id: string }) => model.id) ?? []),
    enabled: !!baseURL && !!apiKey,
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isAdd ? 'Add' : 'Update'}
          {' '}
          AI Gateway
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="add-ai-gateway-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="provider"
              children={(field) => {
                const shouldShowError = field.state.meta.isTouched || form.state.submissionAttempts > 0
                const isInvalid = shouldShowError && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Provider
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      disabled={!isAdd}
                      onValueChange={(value) => {
                        field.handleChange(value!)

                        form.setFieldValue('apiKey', '')
                        if (value !== 'openai-compatible') {
                          form.setFieldValue('baseURL', '')
                        }
                      }}
                    >
                      <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {aiGatewaySchema.shape.provider.options.filter(provider => !aiGateways.some(g => g.provider === provider)).map(provider => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            >
            </form.Field>
            <form.Subscribe
              selector={state => state.values.provider}
              children={provider => (
                provider === 'openai-compatible' && (
                  <form.Field
                    name="baseURL"
                    children={(field) => {
                      const shouldShowError = field.state.meta.isTouched || form.state.submissionAttempts > 0
                      const isInvalid = shouldShowError && !field.state.meta.isValid

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Base URL
                          </FieldLabel>
                          <Input id={field.name} name={field.name} aria-invalid={isInvalid} placeholder="Enter your base URL" value={field.state.value} onBlur={field.handleBlur} onChange={e => field.handleChange(e.target.value)} />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  >
                  </form.Field>
                )
              )}
            />
            <form.Field
              name="apiKey"
              children={(field) => {
                const shouldShowError = field.state.meta.isTouched || form.state.submissionAttempts > 0
                const isInvalid = shouldShowError && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      API Key
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      aria-invalid={isInvalid}
                      type="password"
                      placeholder="Enter your API key"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            >
            </form.Field>
            <form.Field
              name="models"
              children={(field) => {
                const shouldShowError = field.state.meta.isTouched || form.state.submissionAttempts > 0
                const isInvalid = shouldShowError && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Models</FieldLabel>
                    <Combobox items={models} multiple autoHighlight defaultValue={field.state.value} onValueChange={field.handleChange}>
                      <ComboboxChips>
                        <ComboboxValue>
                          {values => (
                            <Fragment>
                              {values.map((value: string) => (<ComboboxChip key={value}>{value}</ComboboxChip>))}
                              <ComboboxChipsInput placeholder="Select models">

                              </ComboboxChipsInput>
                            </Fragment>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent>
                        <ComboboxEmpty>No models found</ComboboxEmpty>
                        <ComboboxList>
                          {item => (<ComboboxItem key={item} value={item}>{item}</ComboboxItem>)}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}

            >
            </form.Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="submit" form="add-ai-gateway-form">
            Save
          </Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
