import {
  Light,
  Honeycomb,
  RoseGold,
  Gold,
  Elegant,
} from './Theme.js'
import {
  Pearl,
  Spark,
  Flower,
  WaterDropBg,
  DefaultBg,
  PinkFlareVideoBg,
  GoldFlareVideoBg,
  BlueFlareVideoBg,
  USFlagBg,
  LgbtPrideBg
} from './BackGround.js'
import { useColorScheme } from 'react-native'
import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorageManager from '../src/class/AsyncStorageManager.js'
import CONSTANTS from '../src/Constants.js'

export const ThemeContext = createContext({
  dark: true,
  theme: Elegant, 
  setScheme: () => { },
  bg: DefaultBg,
  setBg: () => { },
  unread: 0,
  setUnread: () => { },
})

export const ThemeProvider = props => {
  const colorScheme = useColorScheme(colorScheme === 'dark')
  const [theme, setTheme] = useState(Elegant) //Honeycomb
  const [isDark, setIsDark] = useState(colorScheme === 'dark')
  const [bgImage, setBgImage] = useState(DefaultBg)
  const [unread, setUnread] = useState(null)

  useEffect(() => {
    setIsDark(colorScheme === 'dark')
  }, [colorScheme])
  //Customize UI with theme and bg
  //First two not used
  const getTheme = ui => {

    //Need to reduce
    console.log("get theme: " + JSON.stringify(ui));

    if (ui == CONSTANTS.UI.GOLD_PEARL /*'Using '*/) {
      let gold = Gold;
      gold.ui = ui
      gold.dark = false,
      gold.colors.textContrast = 'black',
      gold.bg.name = CONSTANTS.BG_IMG.PEARL;
      return gold // Gold
    }
    else if (ui == CONSTANTS.UI.GOLD_FLOWER /*'elegant'*/) {
      let gold = Gold;
      gold.ui = ui
      gold.dark = false,
      gold.colors.textContrast = 'black',
      gold.bg.name = CONSTANTS.BG_IMG.FLOWER;
      return gold // RoseGold
    }
    else if (ui == CONSTANTS.UI.GOLD_WATER_DROP /*'elegant'*/) {
      let elegant = Gold;
      elegant.ui = ui
      elegant.dark = true,
      elegant.colors.textContrast = 'white',
      elegant.bg.name = CONSTANTS.BG_IMG.WATER_DROP;
      return elegant
    }
    else if (ui == CONSTANTS.UI.US_FLAG /*'elegant'*/) {
      let usTheme = Elegant;
      usTheme.ui = ui
      usTheme.dark = true,
      usTheme.colors.textContrast = 'white',
      usTheme.bg.name = CONSTANTS.BG_IMG.US_FLAG;
      return usTheme // RoseGold
    }
    else if (ui == CONSTANTS.UI.LGBT_PRIDE /*'elegant'*/) {
      let gold = Gold;
      gold.ui = ui
      gold.dark = false,
      gold.colors.textContrast = 'black',
      gold.bg.name = CONSTANTS.BG_IMG.LGBT_PRIDE;
      return gold // RoseGold
    }
    else if (ui == CONSTANTS.UI.PINK_FLARE /*'elegant'*/) {
      let roseGold = RoseGold;
      roseGold.ui = ui
      roseGold.dark = true,
      roseGold.colors.textContrast = 'black',
      roseGold.bg.name = CONSTANTS.BG_IMG.PINK_FLARE;
      return roseGold// RoseGold
    }
    else if (ui == CONSTANTS.UI.GOLD_FLARE /*'elegant'*/) {
      let gold = Gold;
      gold.ui = ui
      gold.dark = true,
      gold.colors.textContrast = 'black',
      gold.bg.name = CONSTANTS.BG_IMG.GOLD_FLARE;
      return gold // RoseGold
    }
    else if (ui == CONSTANTS.UI.BLUE_FLARE /*'elegant'*/) {
      let elegent = Elegant;
      elegent.ui = ui
      elegent.dark = true,
      elegent.colors.textContrast = 'white',
      elegent.bg.name = CONSTANTS.BG_IMG.BLUE_FLARE;
      return elegent // RoseGold
    }
    else {
      let elegant = Elegant;
      elegant.ui = ui
      elegant.dark = true,
      elegant.colors.textContrast = 'white',
      elegant.bg.name = CONSTANTS.BG_IMG.DEFAULT;
      return elegant
    }
  }

  const getBg = bg => {

    if (bg == CONSTANTS.BG_IMG.PEARL /*'WaveBg' Sea wave*/) {
      return Pearl
    }
    else if (bg == CONSTANTS.BG_IMG.SPARK /*'WaveBg' Sea wave*/) {
      return Spark
    }
    else if (bg == CONSTANTS.BG_IMG.FLOWER /*'WaveBg' Sea wave*/) {
      return Flower
    }
    else if (bg == CONSTANTS.BG_IMG.WATER_DROP /*'WaterDropBg'*/) {
      return WaterDropBg
    }

    else if (bg == CONSTANTS.BG_IMG.US_FLAG /*'WaveBg' Sea wave*/) {
      return USFlagBg
    }
    else if (bg == CONSTANTS.BG_IMG.LGBT_PRIDE /*'WaterDropBg'*/) {
      return LgbtPrideBg
    }
    
    else if (bg == CONSTANTS.BG_IMG.DEFAULT /*'WaterDropBg'*/) {
      return DefaultBg
    }
    //Video Bg
    else if (bg == CONSTANTS.BG_IMG.PINK_FLARE /*'WaterDropBg'*/) {
      return PinkFlareVideoBg
    }
    else if (bg == CONSTANTS.BG_IMG.GOLD_FLARE /*'WaterDropBg'*/) {
      return GoldFlareVideoBg
    }
    else if (bg == CONSTANTS.BG_IMG.BLUE_FLARE /*'WaterDropBg'*/) {
      return BlueFlareVideoBg
    }
    else {
      return WaterDropBg
    }
  }

  const defaultTheme = {
    dark: isDark,
    theme: theme,
    setScheme: ui => {
      let theme = getTheme(ui)
      setTheme(theme)
      AsyncStorageManager.storeData(CONSTANTS.CURRENT_THEME_NAME, theme?.ui + '')
      AsyncStorageManager.storeData(CONSTANTS.CURRENT_THEME, JSON.stringify(theme))

      const bg = getBg(theme.bg.name)
      setBgImage(bg)
    },

    bg: bgImage,
    setBg: bgImg => {
      // console.log('Got ==> ....', bgImg)
      const bg = getBg(bgImg)
      setBgImage(bg)
      AsyncStorageManager.storeData(CONSTANTS.CURRENT_BG_NAME, bg?.name)
      AsyncStorageManager.storeData(CONSTANTS.CURRENT_BG_TYPE, bg?.type)
      AsyncStorageManager.storeData(CONSTANTS.CURRENT_BG, JSON.stringify(bg))
    },

    unread: unread,
    setUnread: count => {
      setUnread(count)
      AsyncStorageManager.storeData(CONSTANTS.UNREAD_COUNT, count + '')
    }
  }

  return (
    <ThemeContext.Provider value={defaultTheme}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
