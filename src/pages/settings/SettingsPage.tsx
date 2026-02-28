import React, { useEffect, useState } from 'react';
import { Send, Info, Globe, ChevronDown, Bell } from 'lucide-react';
import { NotificationSettings, NotificationChannel } from '@/types';
import { settingsApi } from '@/api/settings.api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField } from '@/components/shared/FormField';

const MINUTES_OPTIONS = [
  { value: 15, label: '15 minuti prima' },
  { value: 30, label: '30 minuti prima' },
  { value: 60, label: '1 ora prima' },
  { value: 120, label: '2 ore prima' },
  { value: 360, label: '6 ore prima' },
  { value: 1440, label: '1 giorno prima' },
  { value: 2880, label: '2 giorni prima' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Rome',      label: 'Italia — Roma (UTC+1/+2)' },
  { value: 'Europe/London',    label: 'Regno Unito — Londra (UTC+0/+1)' },
  { value: 'Europe/Paris',     label: 'Francia — Parigi (UTC+1/+2)' },
  { value: 'Europe/Berlin',    label: 'Germania — Berlino (UTC+1/+2)' },
  { value: 'Europe/Madrid',    label: 'Spagna — Madrid (UTC+1/+2)' },
  { value: 'Europe/Zurich',    label: 'Svizzera — Zurigo (UTC+1/+2)' },
  { value: 'Europe/Amsterdam', label: 'Paesi Bassi — Amsterdam (UTC+1/+2)' },
  { value: 'Europe/Brussels',  label: 'Belgio — Bruxelles (UTC+1/+2)' },
  { value: 'Europe/Vienna',    label: 'Austria — Vienna (UTC+1/+2)' },
  { value: 'Europe/Warsaw',    label: 'Polonia — Varsavia (UTC+1/+2)' },
  { value: 'Europe/Athens',    label: 'Grecia — Atene (UTC+2/+3)' },
  { value: 'Europe/Helsinki',  label: 'Finlandia — Helsinki (UTC+2/+3)' },
  { value: 'Europe/Lisbon',    label: 'Portogallo — Lisbona (UTC+0/+1)' },
  { value: 'Europe/Istanbul',  label: 'Turchia — Istanbul (UTC+3)' },
  { value: 'America/New_York',    label: 'USA Est — New York (UTC−5/−4)' },
  { value: 'America/Chicago',     label: 'USA Centro — Chicago (UTC−6/−5)' },
  { value: 'America/Los_Angeles', label: 'USA Ovest — Los Angeles (UTC−8/−7)' },
  { value: 'America/Sao_Paulo',   label: 'Brasile — San Paolo (UTC−3)' },
  { value: 'Asia/Dubai',       label: 'Emirati Arabi — Dubai (UTC+4)' },
  { value: 'Asia/Kolkata',     label: 'India — Nuova Delhi (UTC+5:30)' },
  { value: 'Asia/Tokyo',       label: 'Giappone — Tokyo (UTC+9)' },
  { value: 'Australia/Sydney', label: 'Australia — Sydney (UTC+10/+11)' },
  { value: 'UTC',              label: 'UTC (Tempo universale coordinato)' },
];

function CollapsibleCard({
  icon,
  title,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="mb-4">
      <CardContent className="pt-5 pb-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-semibold text-sm">{title}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [defaultPhone, setDefaultPhone] = useState('');
  const [defaultChannel, setDefaultChannel] = useState<NotificationChannel>('WHATSAPP');
  const [defaultMinutes, setDefaultMinutes] = useState(60);
  const [timezone, setTimezone] = useState('Europe/Rome');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [testPhone, setTestPhone] = useState('');
  const [testChannel, setTestChannel] = useState<NotificationChannel>('WHATSAPP');
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testError, setTestError] = useState('');

  useEffect(() => {
    settingsApi
      .getNotifications()
      .then((s) => {
        setSettings(s);
        setDefaultPhone(s.defaultPhone ?? '');
        setDefaultChannel(s.defaultChannel);
        setDefaultMinutes(s.defaultMinutes);
        setTimezone(s.timezone ?? 'Europe/Rome');
        setTestPhone(s.defaultPhone ?? '');
        setTestChannel(s.defaultChannel);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      await settingsApi.updateNotifications({
        defaultPhone: defaultPhone || undefined,
        defaultChannel,
        defaultMinutes,
        timezone,
      });
      setSaveMsg('Impostazioni salvate con successo.');
    } catch {
      setSaveMsg('Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPhone.trim()) {
      setTestError('Inserisci un numero di telefono per il test.');
      return;
    }
    setTesting(true);
    setTestMsg('');
    setTestError('');
    try {
      await settingsApi.sendTest(testPhone.trim(), testChannel);
      setTestMsg('Notifica di test inviata con successo! Controlla il tuo telefono.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setTestError(msg || "Errore durante l'invio. Controlla le credenziali Twilio nel file .env.");
    } finally {
      setTesting(false);
    }
  };

  const localTimePreview = new Date().toLocaleString('it-IT', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Impostazioni" description="Configura fuso orario e notifiche" />

      {/* Fuso orario */}
      <CollapsibleCard icon={<Globe className="h-4 w-4 text-muted-foreground" />} title="Fuso orario">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Usato per mostrare l'orario corretto nei messaggi di promemoria (SMS/WhatsApp).
            Il server gira in UTC: senza questa impostazione gli orari nelle notifiche
            sarebbero sbagliati.
          </p>
          <FormField label="Fuso orario">
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <p className="text-xs text-muted-foreground">
            Ora locale attuale:{' '}
            <span className="font-medium text-foreground">{localTimePreview}</span>
          </p>
        </div>
      </CollapsibleCard>

      {/* Configurazione Twilio */}
      <CollapsibleCard icon={<Info className="h-4 w-4 text-blue-500" />} title="Configurazione Twilio">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Per inviare SMS e messaggi WhatsApp è necessario configurare Twilio nel file{' '}
            <code className="bg-muted px-1 py-0.5 rounded">.env</code> del progetto.
          </p>
          <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>
              Crea un account gratuito su <span className="font-mono">twilio.com/try-twilio</span>
            </li>
            <li>
              Dal dashboard copia <strong>Account SID</strong> e <strong>Auth Token</strong>
            </li>
            <li>
              Per <strong>SMS</strong>: acquista un numero Twilio (~$1/mese) o usa il trial
            </li>
            <li>
              Per <strong>WhatsApp Sandbox</strong>: vai su Twilio Console → Messaging → Try WhatsApp
            </li>
            <li>
              Aggiungi le variabili nel file{' '}
              <code className="bg-muted px-1 py-0.5 rounded">.env</code>:
            </li>
          </ol>
          <pre className="bg-slate-900 text-green-400 text-xs p-3 rounded-md overflow-x-auto">
{`TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886`}
          </pre>
          <p className="text-xs text-amber-600">
            ⚠️ Per WhatsApp: ogni destinatario deve inviare una volta il codice sandbox al numero
            Twilio WhatsApp.
          </p>
        </div>
      </CollapsibleCard>

      {/* Preferenze notifiche */}
      <CollapsibleCard icon={<Bell className="h-4 w-4 text-muted-foreground" />} title="Preferenze notifiche">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Numero di telefono predefinito">
            <Input
              value={defaultPhone}
              onChange={(e) => setDefaultPhone(e.target.value)}
              placeholder="+39 333 000 0000"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Canale predefinito">
              <Select
                value={defaultChannel}
                onValueChange={(v) => setDefaultChannel(v as NotificationChannel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Anticipo predefinito">
              <Select
                value={String(defaultMinutes)}
                onValueChange={(v) => setDefaultMinutes(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {saveMsg && (
            <p className={`text-xs ${saveMsg.includes('Errore') ? 'text-destructive' : 'text-green-600'}`}>
              {saveMsg}
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? 'Salvataggio...' : 'Salva impostazioni'}
          </Button>
        </form>
      </CollapsibleCard>

      {/* Test notifica */}
      <CollapsibleCard icon={<Send className="h-4 w-4 text-muted-foreground" />} title="Invia notifica di test">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Numero destinatario">
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+39 333 000 0000"
              />
            </FormField>
            <FormField label="Canale">
              <Select
                value={testChannel}
                onValueChange={(v) => setTestChannel(v as NotificationChannel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {testMsg && <p className="text-xs text-green-600">{testMsg}</p>}
          {testError && <p className="text-xs text-destructive">{testError}</p>}

          <Button type="button" variant="outline" onClick={handleTest} disabled={testing}>
            <Send className="h-4 w-4 mr-2" />
            {testing ? 'Invio in corso...' : 'Invia notifica di test'}
          </Button>
        </div>
      </CollapsibleCard>
    </div>
  );
}
