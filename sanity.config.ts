import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import appointments from './src/tools/appointments';
import schedules from './src/tools/schedules';
const projectId = process.env.SANITY_STUDIO_PROJECT_ID
if (!projectId) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID environment variable')
}
const schedulesTool = () => {
  return {
    title: 'Grafik',
    name: 'schedules',
    component: schedules,
  }
}
const appointmentsTool = () => {
  return {
    title: 'Appointments',
    name: 'appointments',
    component: appointments,
  }
}
export default defineConfig({
  name: 'default',
  title: 'myreflection',
  projectId: projectId,
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  tools: [schedulesTool(), appointmentsTool()],
  schema: {
    types: schemaTypes,
  },
})
