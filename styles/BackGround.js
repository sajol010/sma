//Image Backgroudnd
import transparentImg from '../assets/bg/transparent.png';
//New Backgroud
import pearlImg from '../assets/bg/bgPearl.webp'
import flowerImg from '../assets/bg/bgFlower.webp'
import waterDropImg from '../assets/bg/bgWaterDrop.webp';
import defaultImg from '../assets/bg/bgDefult.webp';

import usFlagImg from '../assets/bg/bgUsFlag.webp';
import lgbtPrideImg from '../assets/bg/bgLgbtPride.webp';


//Anim BG Lotti

//Video BG video
import goldFlareVideo from '../assets/bg/goldFlareVideo.mp4';
import pinkFlareVideo from '../assets/bg/pinkFlareVideo.mp4';
import blueFlareVideo from '../assets/bg/blueFlareVideo.mp4';

import CONSTANTS from '../src/Constants';

export const Pearl = {
  name: CONSTANTS.BG_IMG.PEARL, //DarkCloudBg',
  type: 'image',
  file: pearlImg,
  transparentImg: transparentImg,
};

export const Flower = {
  name: CONSTANTS.BG_IMG.FLOWER, //DarkCloudBg',
  type: 'image',
  file: flowerImg,
  transparentImg: transparentImg,
};

export const WaterDropBg = {
  name: CONSTANTS.BG_IMG.WATER_DROP, //'WaterDropBg',
  type: 'image',
  file: waterDropImg,
  transparentImg: transparentImg,
};

export const USFlagBg = {
  name: CONSTANTS.BG_IMG.US_FLAG, //'WaterDropBg',
  type: 'image',
  file: usFlagImg,
  transparentImg: transparentImg,
};

export const LgbtPrideBg = {
  name: CONSTANTS.BG_IMG.LGBT_PRIDE, //'WaterDropBg',
  type: 'image',
  file: lgbtPrideImg,
  transparentImg: transparentImg,
};

export const DefaultBg = {
  name: CONSTANTS.BG_IMG.DEFAULT, //'WaterDropBg',
  type: 'image',
  file: defaultImg,
  transparentImg: transparentImg,
};

//Video BG Resources
export const PinkFlareVideoBg = {
  name: CONSTANTS.BG_IMG.PINK_FLARE, //'WaterDropBg',
  type: 'video',
  file: pinkFlareVideo,
  transparentImg: transparentImg,
};

export const GoldFlareVideoBg = {
  name: CONSTANTS.BG_IMG.GOLD_FLARE, //'WaterDropBg',
  type: 'video',
  file: goldFlareVideo,
  transparentImg: transparentImg,
};

export const BlueFlareVideoBg = {
  name: CONSTANTS.BG_IMG.BLUE_FLARE, //'WaterDropBg',
  type: 'video',
  file: blueFlareVideo,
  transparentImg: transparentImg,
};