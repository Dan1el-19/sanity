import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {CalendarIcon} from '@sanity/icons'
import appointments from './src/tools/appointments';
import schedules from './src/tools/schedules';
import settings from './src/tools/settings';
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
export default defineConfig({
  name: 'default',
  title: 'myreflection',
  projectId: projectId,
  dataset: 'production',
  plugins: [structureTool({title: 'Struktura'}), visionTool()],
  tools: [AppointmentsTool(), SchedulesTool(), SettingsTool()],
  schema: {
    types: schemaTypes,
  },
})
