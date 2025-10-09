import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {CalendarIcon} from '@sanity/icons'
import appointments from './src/tools/appointments';
import schedules from './src/tools/schedules';
import settings from './src/tools/settings';
import blockedSlots from './src/tools/blockedSlots';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
if (!projectId) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID environment variable')
}
const AppointmentsTool = () => {
  return {
    title: 'Wizyty',
    name: 'wizyty',
    icon: CalendarIcon,
    component: appointments,
  }
}
const SchedulesTool = () => {
  return {
    title: 'Grafik',
    name: 'grafik',
    icon: CalendarIcon,
    component: schedules,
  }
}
const SettingsTool = () => {
  return {
    title: 'Ustawienia',
    name: 'ustawienia',
    icon: CalendarIcon,
    component: settings,
  }
}
const BlockedSlotsTool = () => {
  return {
    title: 'Blokady',
    name: 'blokady',
    icon: CalendarIcon,
    component: blockedSlots,
  }
}
export default defineConfig({
  name: 'default',
  title: 'myreflection',
  projectId: projectId,
  dataset: 'production',
  plugins: [
    structureTool({title: 'Struktura'}),
    ...(process.env.NODE_ENV === 'development' ? [visionTool()] : [])
  ],
  tools: [AppointmentsTool(), SchedulesTool(), BlockedSlotsTool(), SettingsTool()],
  schema: {
    types: schemaTypes,
  },
})
