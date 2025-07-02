// import HomeGraySvg from '../../assets/bottom_tab_home_gray.svg';

// const HomeGraySvg = require('../../assets/bottom_tab_home_gray.svg')
// import SvgUri from 'react-native-svg-uri';

class IconManager {
  constructor() {
    // Initialize the utility with any necessary configuration or state
    this.someValue = 42;
  }

  static getIcon(theme, iconName) {

    const uri = `../../assets${theme == 'honey' ? '/honey' : ''}/${iconName}.svg`
    // console.log("first===>", uri)

    // return uri;
  }
}

export default IconManager;
