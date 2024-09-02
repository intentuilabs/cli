const namespaces = [
  'buttons',
  'controls',
  'collections',
  'date-and-time',
  'drag-and-drop',
  'forms',
  'navigation',
  'overlays',
  'pickers',
  'statuses',
  'surfaces',
  'media',
  'colors',
]

const components: any[] = [
  // ------------------------------------------------------------------------------------- //
  //  ✓ Primitives
  // ------------------------------------------------------------------------------------- //
  { name: 'heading' },
  { name: 'primitive' },
  { name: 'dropdown' },
  { name: 'dialog', children: [{ name: 'button' }, { name: 'heading' }] },
  { name: 'field' },
  { name: 'keyboard' },

  // ------------------------------------------------------------------------------------- //
  //  ✓ Utitlities
  // ------------------------------------------------------------------------------------- //
  { name: 'visually-hidden' },

  // ------------------------------------------------------------------------------------- //
  //  ✓ Only Namespaces and Children
  // ------------------------------------------------------------------------------------- //
  {
    name: 'forms',
    children: [
      { name: 'form' },
      { name: 'text-field' },
      { name: 'tag-field' },
      { name: 'radio' },
      { name: 'checkbox' },
      { name: 'textarea' },
      { name: 'number-field' },
      { name: 'search-field' },
      { name: 'input-otp' },
      { name: 'choicebox' },
    ],
  },
  {
    name: 'collections',
    children: [
      { name: 'accordion' },
      { name: 'menu' },
      { name: 'grid-list' },
      { name: 'list-box' },
      { name: 'tabs' },
      { name: 'tag-group' },
      { name: 'table' },
      { name: 'choicebox' },
    ],
  },
  {
    name: 'date-and-time',
    children: [{ name: 'date-field' }, { name: 'date-picker' }, { name: 'date-range-picker' }, { name: 'popover' }],
  },
  {
    name: 'navigation',
    children: [
      { name: 'link' },
      { name: 'breadcrumbs' },
      { name: 'pagination' },
      { name: 'button' },
      { name: 'separator' },
      { name: 'field' },
    ],
  },
  {
    name: 'overlays',
    children: [{ name: 'sheet' }, { name: 'modal' }, { name: 'drawer' }, { name: 'popover' }, { name: 'tooltip' }],
  },
  {
    name: 'pickers',
    children: [{ name: 'combo-box' }, { name: 'select' }, { name: 'multiple-select' }],
  },
  {
    name: 'statuses',
    children: [
      { name: 'skeleton' },
      { name: 'badge' },
      { name: 'loader' },
      { name: 'progress-bar' },
      { name: 'meter' },
      { name: 'note' },
      { name: 'toast' },
    ],
  },
  { name: 'surfaces', children: [{ name: 'card' }, { name: 'grid' }, { name: 'separator' }, { name: 'show-more' }] },
  { name: 'media', children: [{ name: 'avatar' }, { name: 'carousel' }] },
  {
    name: 'colors',
    children: [{ name: 'color-picker' }],
  },
  { name: 'buttons', children: [{ name: 'file-trigger' }, { name: 'toggle' }] },
  { name: 'drag-and-drop', children: [{ name: 'drop-zone' }] },
  {
    name: 'controls',
    children: [
      { name: 'toolbar' },
      { name: 'slider' },
      { name: 'switch' },
      { name: 'command-menu' },
      { name: 'context-menu' },
    ],
  },
  {
    name: 'layouts',
    children: [{ name: 'aside' }, { name: 'container' }],
  },

  // ------------------------------------------------------------------------------------- //
  // ✓ Children
  // ------------------------------------------------------------------------------------- //

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Buttons
  // ------------------------------------------------------------------------------------- //
  { name: 'button' },
  { name: 'file-trigger', children: [{ name: 'button' }] },
  { name: 'toggle' },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Collections
  // ------------------------------------------------------------------------------------- //
  { name: 'accordion' },
  { name: 'menu', children: [{ name: 'dropdown' }, { name: 'keyboard' }, { name: 'popover' }] },
  { name: 'carousel', children: [{ name: 'button' }] },
  { name: 'list-box', children: [{ name: 'dropdown' }, { name: 'field' }] },
  { name: 'tabs' },
  { name: 'tag-group', children: [{ name: 'field' }, { name: 'badge' }] },
  { name: 'table', children: [{ name: 'checkbox' }] },
  { name: 'grid-list', children: [{ name: 'checkbox' }] },
  { name: 'choicebox', children: [{ name: 'checkbox' }, { name: 'field' }] },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Date and Time
  // ------------------------------------------------------------------------------------- //

  { name: 'calendar', children: [{ name: 'button' }] },
  { name: 'range-calendar', children: [{ name: 'calendar' }] },
  { name: 'date-field' },
  { name: 'date-range-picker', children: [{ name: 'date-picker' }] },
  {
    name: 'date-picker',
    children: [
      { name: 'popover' },
      { name: 'field' },
      { name: 'calendar' },
      { name: 'date-field' },
      { name: 'range-calendar' },
    ],
  },
  { name: 'time-field', children: [{ name: 'field' }, { name: 'date-field' }] },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Forms
  // ------------------------------------------------------------------------------------- //

  { name: 'form' },
  { name: 'tag-field', children: [{ name: 'tag-group' }, { name: 'field' }] },
  { name: 'text-field', children: [{ name: 'field' }] },
  { name: 'input-otp' },
  { name: 'radio', children: [{ name: 'field' }] },
  { name: 'checkbox', children: [{ name: 'field' }] },
  { name: 'textarea', children: [{ name: 'field' }] },
  { name: 'number-field', children: [{ name: 'field' }] },
  { name: 'search-field', children: [{ name: 'field' }, { name: 'button' }] },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Navigation
  // ------------------------------------------------------------------------------------- //
  { name: 'link' },
  {
    name: 'pagination',
    children: [{ name: 'button' }],
  },
  {
    name: 'breadcrumbs',
    children: [{ name: 'link' }],
  },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Surfaces
  // ------------------------------------------------------------------------------------- //
  { name: 'card' },
  { name: 'grid' },
  { name: 'separator' },
  { name: 'show-more', children: [{ name: 'button' }] },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Drag And Drop
  // ------------------------------------------------------------------------------------- //
  { name: 'drop-zone' },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Media
  // ------------------------------------------------------------------------------------- //
  { name: 'avatar', children: [{ name: 'visually-hidden' }] },
  { name: 'carousel' },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Overlays
  // ------------------------------------------------------------------------------------- //
  {
    name: 'modal',
    children: [{ name: 'dialog' }],
  },
  {
    name: 'sheet',
    children: [{ name: 'dialog' }],
  },
  {
    name: 'drawer',
    children: [{ name: 'dialog' }],
  },
  { name: 'tooltip' },
  {
    name: 'popover',
    children: [{ name: 'dialog' }],
  },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Pickers
  // ------------------------------------------------------------------------------------- //
  {
    name: 'combo-box',
    children: [{ name: 'field' }, { name: 'list-box' }, { name: 'popover' }],
  },
  {
    name: 'select',
    children: [{ name: 'field' }, { name: 'list-box' }, { name: 'popover' }],
  },
  {
    name: 'multiple-select',
    children: [
      { name: 'field' },
      { name: 'list-box' },
      { name: 'popover' },
      { name: 'tag-group' },
      { name: 'visually-hidden' },
    ],
  },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Statuses
  // ------------------------------------------------------------------------------------- //
  { name: 'skeleton' },
  { name: 'badge' },
  { name: 'loader' },
  { name: 'progress-bar', children: [{ name: 'field' }] },
  { name: 'meter', children: [{ name: 'field' }] },
  { name: 'note' },
  { name: 'toast', children: [{ name: 'button' }, { name: 'loader' }] },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Colors
  // ------------------------------------------------------------------------------------- //

  {
    name: 'color-picker',
    children: [{ name: 'color' }, { name: 'color-field' }, { name: 'select' }],
  },
  { name: 'color', children: [{ name: 'field' }, { name: 'slider' }] },
  { name: 'color-field', children: [{ name: 'color-picker' }] },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Controls
  // ------------------------------------------------------------------------------------- //
  { name: 'command-menu', children: [{ name: 'keyboard' }, { name: 'separator' }] },
  { name: 'context-menu', children: [{ name: 'menu' }] },
  { name: 'slider', children: [{ name: 'field' }] },
  { name: 'switch' },
  { name: 'toolbar', children: [{ name: 'toggle' }, { name: 'separator' }] },

  // ------------------------------------------------------------------------------------- //
  // ⌘ The children of Layouts
  // ------------------------------------------------------------------------------------- //
  { name: 'aside', children: [{ name: 'button' }, { name: 'sheet' }] },
  { name: 'container' },
]

export { components, namespaces }
