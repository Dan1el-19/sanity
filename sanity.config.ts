import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import appointments from './src/tools/appointments';
import { Calendar } from 'lucide-react';

export default defineConfig({
  name: 'default',
  title: 'myreflection',

  projectId: 'REDACTED',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
   tools: (prevTools) => {
    return [
      ...prevTools,
      {
        name: 'appointments',
        title: 'Appointments',
        icon: Calendar,
        component: appointments,
      },
    ];
  },
})
