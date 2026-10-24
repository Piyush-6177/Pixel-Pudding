/**
 * Scene palettes for the canvas-drawn pixel art (landing kitchen, book table).
 * UI colours live in styles/tokens.css; these are the illustration colours.
 */
export const PAL = {
  light: {
    outline: '#4E3A3E', wallTop: '#F8E7CB', wallBot: '#F2D8B6', wallPat: '#EDD2AE', wain: '#DFAA86', wainLight: '#ECC29C', wainDark: '#C28A64',
    table: '#C98B5E', tableLight: '#E0A87A', tableDark: '#AE7148', tableDeep: '#8A5636',
    sky: ['#A6A9D8', '#B8B4DF', '#CDBFE3', '#E5C8DA', '#F3D3C8'], sunGlow: '#FBE6D0', star: '#FFF6D8', moon: '#FFF6E6', moonShade: '#E8DCC8',
    cloud: '#F6F1FA', cloudShade: '#D9CFE8', cloudLight: '#FFFBFE', roof1: '#9A97C9', roof2: '#8C88BE', roofWin: '#B3AFD8', winLit: '#FFE7A8',
    rain: '#FBFAFF', glassShine: '#FFF8FF66', fog: '#EEE9F7',
    wood: '#A8714F', woodLight: '#C98E66', woodDark: '#7A4C37', curtain: '#EDB7C6', curtainLight: '#F8D2DD', curtainShade: '#CF93A8',
    gold: '#F2C14E', goldLight: '#FFE08A', goldDark: '#C4892E', wire: '#5E4548', bulbs: ['#FFD27A', '#F59AA0', '#A8DDB0', '#A9D6E5', '#D9C8EC'], bulbHi: '#FFF8EC',
    cover: '#D9645A', coverLight: '#EB8573', coverDark: '#A9463F', coverInner: '#8E3A36', pages: '#FFF6E4', pagesShade: '#E8D3B0', ribbon: '#6FA8C9', ribbonDark: '#4E86A8',
    heart: '#F07C8A', heartLight: '#FFB3BC', tabs: ['#A8DDB0', '#A9D6E5', '#FFE08A'], pancake: '#E0A96D', pancakeDark: '#C98A4F', syrup: '#B5653A',
    shade: '#FFD27A', shadeLight: '#FFE9B0', shadeDark: '#E9A94F', shadeRim: '#C98A3A', metal: '#8C6F7A', metalLight: '#B597A2', lampBase: '#7E5A6E', lampBaseLight: '#A07D90',
    cup: '#FBF5FA', cupShade: '#D9CCDF', cupAccent: '#F07C8A', tea: '#B0704A', teaLight: '#D0905F', steam: '#FFFDF8',
    cat: '#F2A65E', catLight: '#FFD3A0', catDark: '#C97B3A', blush: '#F59AA0',
    leaf: '#7DBF8A', leafLight: '#A8DDB0', leafDark: '#4F9468', pot: '#D98B6A', potLight: '#EDA987', potDark: '#B06A4F', rope: '#B58E6A',
    glass: '#D8EEF4', glassShade: '#B3D3DF', lids: ['#E07A82', '#8FCB9C', '#A9D6E5'], cookie: '#D39A5C', choc: '#6E4636', pasta: '#F5D98A', pastaDark: '#DDB860',
    candy: ['#F59AA0', '#A9D6E5', '#FFE08A', '#A8DDB0'], paper: '#FFFAF0', paperPink: '#FCE4E8', paperLine: '#E2CDAE', tape: '#A8DDB0B4', pin: '#E07A82',
    books: ['#A8DDB0', '#A9D6E5', '#F59AA0', '#FFE08A', '#D9C8EC'],
    lampWarm: '#FFD98A', lampA: 0.3, windowLight: '#FFF6E8', windowA: 0.22, vig: '#7A4A3A', vigA: 0.2, shadow: '#5A3424', shadowA: 0.22, bulbA: 0.3, sparkle: '#FFF4C9', z: '#7A5A5E',
  },
  dark: {
    outline: '#1A1424', wallTop: '#3E3456', wallBot: '#332A4A', wallPat: '#392F50', wain: '#4C3B5E', wainLight: '#5E4A72', wainDark: '#3A2C4A',
    table: '#7A5143', tableLight: '#946450', tableDark: '#5F3E34', tableDeep: '#432A24',
    sky: ['#121026', '#191633', '#221D42', '#2C2650', '#3A3062'], sunGlow: null, star: '#F7DE9A', moon: '#FFF1D0', moonShade: '#E4D2A8',
    cloud: '#433B68', cloudShade: '#332C55', cloudLight: '#564C80', roof1: '#1C1830', roof2: '#221D3A', roofWin: '#2E2848', winLit: '#F7D27A',
    rain: '#9CC0E2', glassShine: '#C8D8FF2E', fog: '#2E2850',
    wood: '#6A4741', woodLight: '#865A50', woodDark: '#46302C', curtain: '#93709A', curtainLight: '#AD8AB3', curtainShade: '#6F527A',
    gold: '#E8B44A', goldLight: '#F7D27A', goldDark: '#A87A2A', wire: '#140F1C', bulbs: ['#FFD98A', '#FF9FAA', '#9FE3B0', '#9FD3EE', '#D7C2F2'], bulbHi: '#FFF8EC',
    cover: '#BC5650', coverLight: '#D4705F', coverDark: '#863A3A', coverInner: '#6E2E30', pages: '#EADBC2', pagesShade: '#BFAA8C', ribbon: '#5E92B6', ribbonDark: '#3F6F92',
    heart: '#F08A96', heartLight: '#FFB8C0', tabs: ['#8FBFA5', '#8AB6D6', '#F2D58A'], pancake: '#D49A60', pancakeDark: '#B07A44', syrup: '#8E4E30',
    shade: '#FFD98A', shadeLight: '#FFF1C2', shadeDark: '#E8A84E', shadeRim: '#B87A30', metal: '#5E4A5E', metalLight: '#7E687E', lampBase: '#4A3850', lampBaseLight: '#624C6A',
    cup: '#E8DCEA', cupShade: '#B5A6C0', cupAccent: '#E88A92', tea: '#9A5E3E', teaLight: '#B87850', steam: '#F5E9D7',
    cat: '#E29858', catLight: '#F5BE88', catDark: '#A8673A', blush: '#E88A92',
    leaf: '#5E9A72', leafLight: '#7DB58C', leafDark: '#3E6E52', pot: '#A86A55', potLight: '#C2826A', potDark: '#7E4C3E', rope: '#8A6A52',
    glass: '#5A6A8A', glassShade: '#46557A', lids: ['#C76670', '#6FA884', '#7A9EC0'], cookie: '#B88050', choc: '#4E3028', pasta: '#D8BC70', pastaDark: '#B89A50',
    candy: ['#E88A92', '#8AB6D6', '#F2D58A', '#8FBFA5'], paper: '#E8DCC8', paperPink: '#E6CCD4', paperLine: '#BFA88A', tape: '#8FBFA5B4', pin: '#E88A92',
    books: ['#8FBFA5', '#8AB6D6', '#E88A92', '#F2D58A', '#B6A3D4'],
    lampWarm: '#F7C878', lampA: 0.42, windowLight: '#7C8CC8', windowA: 0.2, vig: '#0A0612', vigA: 0.42, shadow: '#0A0612', shadowA: 0.3, bulbA: 0.62, sparkle: '#FFE9A8', z: '#E8DCC8',
  },
};

/** Lamp-shade colours when the lamp is switched off */
export const LAMP_OFF = {
  light: { shade: '#E9D2A6', shadeLight: '#F3E2C2', shadeDark: '#CBAA7C', shadeRim: '#A88A5E' },
  dark: { shade: '#7E6A55', shadeLight: '#927C63', shadeDark: '#5E4D3E', shadeRim: '#4A3B2E' },
};
/** How much darker the room gets with the lamp off */
export const DIM = { light: 0.07, dark: 0.26 };
