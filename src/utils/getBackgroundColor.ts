const colors = [
  'rgb(166, 111, 80)',
  'rgb(57, 89, 89)',
  'rgb(181, 157, 129)',
  'rgb(161, 173, 158)',
  'rgb(199, 194, 165)',
  'rgb(171, 170, 147)',
  'rgb(186, 154, 86)',
  'rgb(130, 130, 105)',
  'rgb(166, 180, 191)',
]

export const getBackgroundColor = (index: number) => colors[index % colors.length]
