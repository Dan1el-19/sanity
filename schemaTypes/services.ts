import {defineField, defineType} from 'sanity'

export const services = defineType({
  name: 'services',
  title: 'Oferta',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nazwa',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'id',
      title: 'Identyfikator',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Czas trwania (min)',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Cena (PLN)',
      type: 'number',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'opis',
      title: 'Opis',
      type: 'array',
      of: [{type: 'block'}],
    }),
  ],
})