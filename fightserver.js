const {Api, JsonRpc} = require('eosjs');
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig');  // development only
const fetch = require('node-fetch'); //node only
const {TextDecoder, TextEncoder} = require('util'); //node only

const ecc = require('eosjs-ecc');
const StringDecoder = require('string_decoder');
const ByteBuffer = require('bytebuffer')
const atob = require('atob');
const Long = ByteBuffer.Long;

const privateKeys = ['**'];
const serverPrivateKey = '**';

const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc('https://chain.wax.io', {fetch}); //required to read blockchain state
const WAX = new Api({rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()}); //required to submit transactions

const CronJob = require("cron").CronJob;

const CONTRACT = 'fightingclub';

const stats = [
    {"rarity": "common", "min": "1", "max": "30", "energy": "100", "health": "20", "rarity_num": "1"},
    {"rarity": "common", "min": "31", "max": "50", "energy": "100", "health": "20", "rarity_num": "1"},
    {"rarity": "uncommon", "min": "1", "max": "30", "energy": "125", "health": "20", "rarity_num": "1"},
    {"rarity": "uncommon", "min": "31", "max": "50", "energy": "125", "health": "20", "rarity_num": "1"},
    {"rarity": "rare", "min": "1", "max": "20", "energy": "100", "health": "25", "rarity_num": "1"},
    {"rarity": "rare", "min": "21", "max": "30", "energy": "100", "health": "25", "rarity_num": "1"},
    {"rarity": "rare", "min": "31", "max": "40", "energy": "125", "health": "25", "rarity_num": "1"},
    {"rarity": "rare", "min": "41", "max": "50", "energy": "125", "health": "25", "rarity_num": "1"},
    {"rarity": "epic", "min": "1", "max": "10", "energy": "125", "health": "25", "rarity_num": "2"},
    {"rarity": "epic", "min": "11", "max": "20", "energy": "150", "health": "25", "rarity_num": "2"},
    {"rarity": "epic", "min": "21", "max": "30", "energy": "125", "health": "30", "rarity_num": "2"},
    {"rarity": "epic", "min": "31", "max": "40", "energy": "150", "health": "30", "rarity_num": "2"},
    {"rarity": "epic", "min": "41", "max": "50", "energy": "150", "health": "30", "rarity_num": "2"},
    {"rarity": "legendary", "min": "1", "max": "10", "energy": "150", "health": "30", "rarity_num": "3"},
    {"rarity": "legendary", "min": "11", "max": "20", "energy": "175", "health": "30", "rarity_num": "3"},
    {"rarity": "legendary", "min": "21", "max": "30", "energy": "150", "health": "35", "rarity_num": "3"},
    {"rarity": "legendary", "min": "31", "max": "40", "energy": "175", "health": "35", "rarity_num": "3"},
    {"rarity": "legendary", "min": "41", "max": "50", "energy": "175", "health": "35", "rarity_num": "3"},
    {"rarity": "mythic", "min": "1", "max": "20", "energy": "200", "health": "40", "rarity_num": "4"},
    {"rarity": "mythic", "min": "21", "max": "40", "energy": "200", "health": "40", "rarity_num": "4"},
    {"rarity": "mythic", "min": "41", "max": "50", "energy": "225", "health": "40", "rarity_num": "4"},
    {"rarity": "golden", "min": "1", "max": "10", "energy": "225", "health": "40", "rarity_num": "4"},
    {"rarity": "golden", "min": "11", "max": "20", "energy": "200", "health": "45", "rarity_num": "4"},
    {"rarity": "golden", "min": "21", "max": "30", "energy": "200", "health": "45", "rarity_num": "4"},
    {"rarity": "golden", "min": "31", "max": "40", "energy": "225", "health": "45", "rarity_num": "4"},
    {"rarity": "golden", "min": "41", "max": "50", "energy": "225", "health": "45", "rarity_num": "4"},
    {"rarity": "secret", "min": "1", "max": "50", "energy": "250", "health": "50", "rarity_num": "5"}  
];

const alien_stats = [
    {"template_id":"19655", "energy": "100", "health": "20", "rarity_num": "1"},
    {"template_id":"19656", "energy": "100", "health": "20", "rarity_num": "1"},
    {"template_id":"19657", "energy": "100", "health": "20", "rarity_num": "1"},
    {"template_id":"19654", "energy": "100", "health": "20", "rarity_num": "1"},
    {"template_id":"19651", "energy": "100", "health": "20", "rarity_num": "1"},
    {"template_id":"19650", "energy": "100", "health": "20", "rarity_num": "1"},
    {"template_id":"19628", "energy": "100", "health": "20", "rarity_num": "1"},
    {"template_id":"19640", "energy": "125", "health": "20", "rarity_num": "1"},
    {"template_id":"19635", "energy": "125", "health": "20", "rarity_num": "1"},
    {"template_id":"19647", "energy": "100", "health": "25", "rarity_num": "1"},
    {"template_id":"19638", "energy": "100", "health": "25", "rarity_num": "1"},
    {"template_id":"19626", "energy": "125", "health": "25", "rarity_num": "1"},
    {"template_id":"13728", "energy": "125", "health": "25", "rarity_num": "1"},
    {"template_id":"17453", "energy": "125", "health": "25", "rarity_num": "1"},

    {"template_id":"19629", "energy": "125", "health": "25", "rarity_num": "2"},
    {"template_id":"19653", "energy": "125", "health": "25", "rarity_num": "2"},
    {"template_id":"19652", "energy": "150", "health": "25", "rarity_num": "2"},
    {"template_id":"19641", "energy": "150", "health": "25", "rarity_num": "2"},
    {"template_id":"19631", "energy": "125", "health": "30", "rarity_num": "2"},
    {"template_id":"19643", "energy": "125", "health": "30", "rarity_num": "2"},
    {"template_id":"19646", "energy": "150", "health": "30", "rarity_num": "2"},
    {"template_id":"19634", "energy": "150", "health": "30", "rarity_num": "2"},

    {"template_id":"19660", "energy": "150", "health": "30", "rarity_num": "3"},
    {"template_id":"19658", "energy": "175", "health": "30", "rarity_num": "3"},
    {"template_id":"19633", "energy": "150", "health": "35", "rarity_num": "3"},
    {"template_id":"19645", "energy": "150", "health": "35", "rarity_num": "3"},
    {"template_id":"19624", "energy": "175", "health": "35", "rarity_num": "3"},
    {"template_id":"19636", "energy": "175", "health": "35", "rarity_num": "3"},

    {"template_id":"19659", "energy": "200", "health": "40", "rarity_num": "4"},
    {"template_id":"19642", "energy": "200", "health": "40", "rarity_num": "4"},
    {"template_id":"19630", "energy": "225", "health": "40", "rarity_num": "4"},
    {"template_id":"20993", "energy": "225", "health": "40", "rarity_num": "4"},
    {"template_id":"20984", "energy": "200", "health": "45", "rarity_num": "4"},
    {"template_id":"20985", "energy": "200", "health": "45", "rarity_num": "4"},
    {"template_id":"20987", "energy": "225", "health": "45", "rarity_num": "4"},
    {"template_id":"20986", "energy": "225", "health": "45", "rarity_num": "4"},

    {"template_id":"20991", "energy": "250", "health": "50", "rarity_num": "5"},
];

var gpk_stats = [ 
  {"rarity":"base","min": "1", "max": "5", "energy" : "100", "health" : "20", "rarity_num" : "1", "schema": "series1"},
  { "rarity":"base","min" : "6", "max" : "10", "energy" : "100", "health" : "20", "rarity_num" : "1" , "schema": "series1"},
  { "rarity":"base","min" : "11", "max" : "15", "energy" : "125", "health" : "20", "rarity_num" : "1" , "schema": "series1"},
  { "rarity":"base","min" : "16", "max" : "20", "energy" : "125", "health" : "20", "rarity_num" : "1", "schema": "series1" },
  { "rarity":"base","min" : "21", "max" : "25", "energy" : "100", "health" : "25", "rarity_num" : "1" , "schema": "series1"},
  { "rarity":"base","min" : "26", "max" : "30", "energy" : "100", "health" : "25", "rarity_num" : "1", "schema": "series1" },
  { "rarity":"base","min" : "31", "max" : "35", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "series1"},
  { "rarity":"base","min" : "36", "max" : "41", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "series1"},

  { "rarity":"prism","min" : "1", "max" : "5", "energy" : "125", "health" : "25", "rarity_num" : "2" , "schema": "series1"},
  { "rarity":"prism","min" : "6", "max" : "10", "energy" : "125", "health" : "25", "rarity_num" : "2", "schema": "series1" },
  { "rarity":"prism","min" : "11", "max" : "15", "energy" : "150", "health" : "25", "rarity_num" : "2", "schema": "series1" },
  { "rarity":"prism","min" : "16", "max" : "20", "energy" : "150", "health" : "25", "rarity_num" : "2", "schema": "series1" },
  { "rarity":"prism","min" : "21", "max" : "25", "energy" : "125", "health" : "30", "rarity_num" : "2", "schema": "series1" },
  { "rarity":"prism","min" : "26", "max" : "30", "energy" : "125", "health" : "30", "rarity_num" : "2", "schema": "series1" },
  { "rarity":"prism","min" : "31", "max" : "35", "energy" : "150", "health" : "30", "rarity_num" : "2", "schema": "series1" },
  { "rarity":"prism","min" : "36", "max" : "41", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "series1"},

  { "rarity":"sketch","min" : "1", "max" : "5", "energy" : "150", "health" : "30", "rarity_num" : "3" , "schema": "series1"},
  { "rarity":"sketch","min" : "6", "max" : "10", "energy" : "150", "health" : "25", "rarity_num" : "3" , "schema": "series1"},
  { "rarity":"sketch","min" : "11", "max" : "15", "energy" : "175", "health" : "25", "rarity_num" : "3", "schema": "series1" },
  { "rarity":"sketch","min" : "16", "max" : "20", "energy" : "175", "health" : "25", "rarity_num" : "3", "schema": "series1" },
  { "rarity":"sketch","min" : "21", "max" : "25", "energy" : "150", "health" : "30", "rarity_num" : "3", "schema": "series1" },
  { "rarity":"sketch","min" : "26", "max" : "30", "energy" : "150", "health" : "30", "rarity_num" : "3" , "schema": "series1"},
  { "rarity":"sketch","min" : "31", "max" : "35", "energy" : "175", "health" : "30", "rarity_num" : "3", "schema": "series1" },
  { "rarity":"sketch","min" : "36", "max" : "41", "energy" : "175", "health" : "30", "rarity_num" : "3", "schema": "series1" },


  { "rarity":"golden","min" : "0", "max" : "0", "energy" : "250", "health" : "50", "rarity_num" : "5" , "schema": "series1"},
  { "rarity":"collector","min" : "0", "max" : "0", "energy" : "250", "health" : "50", "rarity_num" : "5", "schema": "series1"},

  /*exotic*/

  { "rarity":"base","min" : "1", "max" : "2", "energy" : "100", "health" : "20", "rarity_num" : "1" , "schema": "exotic" },
  { "rarity":"base","min" : "3", "max" : "4", "energy" : "100", "health" : "20", "rarity_num" : "1" , "schema": "exotic" },
  { "rarity":"base","min" : "5", "max" : "6", "energy" : "125", "health" : "20", "rarity_num" : "1" , "schema": "exotic" },
  { "rarity":"base","min" : "7", "max" : "8", "energy" : "125", "health" : "20", "rarity_num" : "1" , "schema": "exotic" },
  { "rarity":"base","min" : "9", "max" : "10", "energy" : "100", "health" : "25", "rarity_num" : "1" , "schema": "exotic" },
  { "rarity":"base","min" : "11", "max" : "12", "energy" : "100", "health" : "25", "rarity_num" : "1" , "schema": "exotic" },
  { "rarity":"base","min" : "13", "max" : "14", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "exotic" },
  { "rarity":"base","min" : "15", "max" : "15", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "exotic" },

  { "rarity":"prism","min" : "1", "max" : "2", "energy" : "125", "health" : "25", "rarity_num" : "2" , "schema": "exotic" },
  { "rarity":"prism","min" : "3", "max" : "4", "energy" : "125", "health" : "25", "rarity_num" : "2" , "schema": "exotic" },
  { "rarity":"prism","min" : "5", "max" : "6", "energy" : "150", "health" : "25", "rarity_num" : "2" , "schema": "exotic" },
  { "rarity":"prism","min" : "7", "max" : "8", "energy" : "150", "health" : "25", "rarity_num" : "2" , "schema": "exotic" },
  { "rarity":"prism","min" : "9", "max" : "10", "energy" : "125", "health" : "30", "rarity_num" : "2" , "schema": "exotic" },
  { "rarity":"prism","min" : "11", "max" : "12", "energy" : "125", "health" : "30", "rarity_num" : "2" , "schema": "exotic" },
  { "rarity":"prism","min" : "13", "max" : "14", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "exotic" },
  { "rarity":"prism","min" : "15", "max" : "15", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "exotic" },

  { "rarity":"tigerborder","min" : "1", "max" : "2", "energy" : "150", "health" : "30", "rarity_num" : "3" , "schema": "exotic" },
  { "rarity":"tigerborder","min" : "3", "max" : "4", "energy" : "150", "health" : "25", "rarity_num" : "3" , "schema": "exotic" },
  { "rarity":"tigerborder","min" : "5", "max" : "6", "energy" : "175", "health" : "25", "rarity_num" : "3" , "schema": "exotic" },
  { "rarity":"tigerborder","min" : "7", "max" : "8", "energy" : "175", "health" : "25", "rarity_num" : "3", "schema": "exotic"  },
  { "rarity":"tigerborder","min" : "9", "max" : "10", "energy" : "150", "health" : "30", "rarity_num" : "3" , "schema": "exotic" },
  { "rarity":"tigerborder","min" : "11", "max" : "12", "energy" : "150", "health" : "30", "rarity_num" : "3", "schema": "exotic"  },
  { "rarity":"tigerborder","min" : "13", "max" : "14", "energy" : "175", "health" : "30", "rarity_num" : "3", "schema": "exotic"  },
  { "rarity":"tigerborder","min" : "15", "max" : "15", "energy" : "175", "health" : "30", "rarity_num" : "3", "schema": "exotic"  },

  { "rarity":"tigercratch","min" : "1", "max" : "2", "energy" : "200", "health" : "40", "rarity_num" : "4", "schema": "exotic"  },
  { "rarity":"tigercratch","min" : "3", "max" : "4", "energy" : "200", "health" : "40", "rarity_num" : "4" , "schema": "exotic" },
  { "rarity":"tigercratch","min" : "5", "max" : "6", "energy" : "225", "health" : "40", "rarity_num" : "4", "schema": "exotic"  },
  { "rarity":"tigercratch","min" : "7", "max" : "8", "energy" : "225", "health" : "40", "rarity_num" : "4" , "schema": "exotic" },
  { "rarity":"tigercratch","min" : "9", "max" : "10", "energy" : "200", "health" : "45", "rarity_num" : "4", "schema": "exotic"  },
  { "rarity":"tigercratch","min" : "11", "max" : "12", "energy" : "200", "health" : "45", "rarity_num" : "4" , "schema": "exotic" },
  { "rarity":"tigercratch","min" : "13", "max" : "14", "energy" : "225", "health" : "45", "rarity_num" : "4", "schema": "exotic"  },
  { "rarity":"tigercratch","min" : "15", "max" : "15", "energy" : "225", "health" : "45", "rarity_num" : "4" , "schema": "exotic" },

  { "rarity":"collector","min" : "0", "max" : "0", "energy" : "250", "health" : "50", "rarity_num" : "5" , "schema": "exotic" },

  /*crashgordon*/
  { "rarity":"base","min" : "1", "type" : "a", "energy" : "100", "health" : "20", "rarity_num" : "1" , "schema": "crashgordon" },
  { "rarity":"base","min" : "2", "type" : "a", "energy" : "100", "health" : "20", "rarity_num" : "1" , "schema": "crashgordon"},
  { "rarity":"base","min" : "3", "type" : "a", "energy" : "125", "health" : "20", "rarity_num" : "1" , "schema": "crashgordon"},
  { "rarity":"base","min" : "4", "type" : "a", "energy" : "125", "health" : "20", "rarity_num" : "1" , "schema": "crashgordon"},
  { "rarity":"base","min" : "5", "type" : "a", "energy" : "100", "health" : "25", "rarity_num" : "1" , "schema": "crashgordon"},
  { "rarity":"base","min" : "1", "type" : "b", "energy" : "100", "health" : "25", "rarity_num" : "1" , "schema": "crashgordon"},
  { "rarity":"base","min" : "2", "type" : "b", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "crashgordon"},
  { "rarity":"base","min" : "3", "type" : "b", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "crashgordon"},
  { "rarity":"base","min" : "4", "type" : "b", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "crashgordon"},
  { "rarity":"base","min" : "5", "type" : "b", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "crashgordon"},

  { "rarity":"prism","min" : "1", "type" : "a", "energy" : "125", "health" : "25", "rarity_num" : "2"  , "schema": "crashgordon"},
  { "rarity":"prism","min" : "2", "type" : "a", "energy" : "125", "health" : "25", "rarity_num" : "2"  , "schema": "crashgordon"},
  { "rarity":"prism","min" : "3", "type" : "a", "energy" : "150", "health" : "25", "rarity_num" : "2" , "schema": "crashgordon" },
  { "rarity":"prism","min" : "4", "type" : "a", "energy" : "150", "health" : "25", "rarity_num" : "2" , "schema": "crashgordon" },
  { "rarity":"prism","min" : "5", "type" : "a", "energy" : "125", "health" : "30", "rarity_num" : "2" , "schema": "crashgordon" },
  { "rarity":"prism","min" : "1", "type" : "b", "energy" : "125", "health" : "30", "rarity_num" : "2" , "schema": "crashgordon" },
  { "rarity":"prism","min" : "2", "type" : "b", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "crashgordon" },
  { "rarity":"prism","min" : "3", "type" : "b", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "crashgordon" },
  { "rarity":"prism","min" : "4", "type" : "b", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "crashgordon" },
  { "rarity":"prism","min" : "5", "type" : "b", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "crashgordon" },

  { "rarity":"tigercratch","min" : "1", "type" : "a", "energy" : "200", "health" : "40", "rarity_num" : "4" , "schema": "crashgordon"},
  { "rarity":"tigercratch","min" : "2", "type" : "a", "energy" : "200", "health" : "40", "rarity_num" : "4", "schema": "crashgordon" },
  { "rarity":"tigercratch","min" : "3", "type" : "a", "energy" : "225", "health" : "40", "rarity_num" : "4", "schema": "crashgordon" },
  { "rarity":"tigercratch","min" : "4", "type" : "a", "energy" : "225", "health" : "40", "rarity_num" : "4" , "schema": "crashgordon"},
  { "rarity":"tigercratch","min" : "5", "type" : "a", "energy" : "200", "health" : "45", "rarity_num" : "4", "schema": "crashgordon" },
  { "rarity":"tigercratch","min" : "1", "type" : "b", "energy" : "200", "health" : "45", "rarity_num" : "4", "schema": "crashgordon" },
  { "rarity":"tigercratch","min" : "2", "type" : "b", "energy" : "225", "health" : "45", "rarity_num" : "4", "schema": "crashgordon" },
  { "rarity":"tigercratch","min" : "3", "type" : "b", "energy" : "225", "health" : "45", "rarity_num" : "4", "schema": "crashgordon" },
  { "rarity":"tigercratch","min" : "4", "type" : "b", "energy" : "225", "health" : "45", "rarity_num" : "4", "schema": "crashgordon" },
  { "rarity":"tigercratch","min" : "5", "type" : "b", "energy" : "225", "health" : "45", "rarity_num" : "4", "schema": "crashgordon" },

  /*series2*/
  { "rarity":"base","min" : "42", "max" : "46", "energy" : "100", "health" : "20", "rarity_num" : "1" , "schema": "series2" },
  { "rarity":"base","min" : "47", "max" : "51", "energy" : "100", "health" : "20", "rarity_num" : "1" , "schema": "series2" },
  { "rarity":"base","min" : "52", "max" : "56", "energy" : "125", "health" : "20", "rarity_num" : "1" , "schema": "series2" },
  { "rarity":"base","min" : "57", "max" : "61", "energy" : "125", "health" : "20", "rarity_num" : "1" , "schema": "series2" },
  { "rarity":"base","min" : "62", "max" : "66", "energy" : "100", "health" : "25", "rarity_num" : "1" , "schema": "series2" },
  { "rarity":"base","min" : "67", "max" : "71", "energy" : "100", "health" : "25", "rarity_num" : "1" , "schema": "series2" },
  { "rarity":"base","min" : "72", "max" : "76", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "series2" },
  { "rarity":"base","min" : "77", "max" : "83", "energy" : "125", "health" : "25", "rarity_num" : "1" , "schema": "series2" },

  { "rarity":"raw","min" : "42", "max" : "51", "energy" : "125", "health" : "25", "rarity_num" : "2" , "schema": "series2" },
  { "rarity":"raw","min" : "52", "max" : "61", "energy" : "125", "health" : "25", "rarity_num" : "2" , "schema": "series2" },
  { "rarity":"raw","min" : "62", "max" : "71", "energy" : "150", "health" : "25", "rarity_num" : "2" , "schema": "series2" },
  { "rarity":"raw","min" : "72", "max" : "83", "energy" : "150", "health" : "25", "rarity_num" : "2" , "schema": "series2" },
  { "rarity":"returning","min" : "1", "max" : "3", "energy" : "125", "health" : "30", "rarity_num" : "2" , "schema": "series2" },
  { "rarity":"returning","min" : "4", "max" : "6", "energy" : "125", "health" : "30", "rarity_num" : "2" , "schema": "series2" },
  { "rarity":"returning","min" : "7", "max" : "9", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "series2" },
  { "rarity":"returning","min" : "10", "max" : "13", "energy" : "150", "health" : "30", "rarity_num" : "2" , "schema": "series2" },

  { "rarity":"sketch","min" : "42", "max" : "51", "energy" : "150", "health" : "30", "rarity_num" : "3" , "schema": "series2" },
  { "rarity":"sketch","min" : "52", "max" : "61", "energy" : "150", "health" : "25", "rarity_num" : "3" , "schema": "series2" },
  { "rarity":"sketch","min" : "62", "max" : "71", "energy" : "175", "health" : "25", "rarity_num" : "3" , "schema": "series2" },
  { "rarity":"sketch","min" : "72", "max" : "83", "energy" : "175", "health" : "25", "rarity_num" : "3", "schema": "series2"  },
  { "rarity":"slime","min" : "42", "max" : "62", "energy" : "150", "health" : "30", "rarity_num" : "3" , "schema": "series2" },
  { "rarity":"slime","min" : "63", "max" : "83", "energy" : "150", "health" : "30", "rarity_num" : "3", "schema": "series2"  },
  { "rarity":"gum","min" : "42", "max" : "62", "energy" : "175", "health" : "30", "rarity_num" : "3", "schema": "series2"  },
  { "rarity":"gum","min" : "63", "max" : "83", "energy" : "175", "health" : "30", "rarity_num" : "3", "schema": "series2"  },

  { "rarity":"vhs","min" : "42", "max" : "46", "energy" : "200", "health" : "40", "rarity_num" : "4", "schema": "series2"  },
  { "rarity":"vhs","min" : "47", "max" : "51", "energy" : "200", "health" : "40", "rarity_num" : "4" , "schema": "series2" },
  { "rarity":"vhs","min" : "52", "max" : "56", "energy" : "225", "health" : "40", "rarity_num" : "4", "schema": "series2"  },
  { "rarity":"vhs","min" : "57", "max" : "61", "energy" : "225", "health" : "40", "rarity_num" : "4" , "schema": "series2" },
  { "rarity":"vhs","min" : "62", "max" : "66", "energy" : "200", "health" : "45", "rarity_num" : "4", "schema": "series2"  },
  { "rarity":"vhs","min" : "57", "max" : "71", "energy" : "200", "health" : "45", "rarity_num" : "4" , "schema": "series2" },
  { "rarity":"vhs","min" : "72", "max" : "76", "energy" : "225", "health" : "45", "rarity_num" : "4", "schema": "series2"  },
  { "rarity":"vhs","min" : "77", "max" : "83", "energy" : "225", "health" : "45", "rarity_num" : "4" , "schema": "series2" },

  { "rarity":"collector","min" : "0", "max" : "0", "energy" : "250", "health" : "50", "rarity_num" : "5" , "schema": "series2" },

];



var kogs_stats = [
  { "rarity":"common","color1" : "blue","color2" : "", "energy" : "100", "health" : "20", "rarity_num" : "1","object": "Kog" ,"foil":"0" },
  { "rarity":"common","color1" : "light blue","color2" : "", "energy" : "100", "health" : "20", "rarity_num" : "1"  ,"object": "Kog" ,"foil":"0"},
  { "rarity":"common","color1" : "turquoise","color2" : "", "energy" : "125", "health" : "20", "rarity_num" : "1"  ,"object": "Kog" ,"foil":"0"},
  { "rarity":"common","color1" : "green","color2" : "", "energy" : "125", "health" : "20", "rarity_num" : "1"  ,"object": "Kog" ,"foil":"0"},
  { "rarity":"uncommon","color1" : "purple","color2" : "", "energy" : "100", "health" : "25", "rarity_num" : "1"  ,"object": "Kog" ,"foil":"0"},
  { "rarity":"uncommon","color1" : "teal","color2" : "", "energy" : "100", "health" : "25", "rarity_num" : "1"  ,"object": "Kog" ,"foil":"0"},
  { "rarity":"uncommon","color1" : "yellow","color2" : "", "energy" : "125", "health" : "25", "rarity_num" : "1"  ,"object": "Kog" ,"foil":"0"},
  { "rarity":"uncommon","color1" : "orange","color2" : "red", "energy" : "125", "health" : "25", "rarity_num" : "1"  ,"object": "Kog" ,"foil":"0"},

  { "rarity":"rare","color1" : "black","color2" : "", "energy" : "125", "health" : "25", "rarity_num" : "2" ,"object": "Kog" ,"foil":"0" },
  { "rarity":"rare","color1" : "white","color2" : "", "energy" : "125", "health" : "25", "rarity_num" : "2","object": "Kog" ,"foil":"0"  },
  { "rarity":"rare","color1" : "pink","color2" : "", "energy" : "150", "health" : "25", "rarity_num" : "2"  ,"object": "Kog" ,"foil":"0"},
  { "rarity":"rare","color1" : "blood orange","color2" : "", "energy" : "150", "health" : "25", "rarity_num" : "2"  ,"object": "Kog" ,"foil":"0"},
  { "rarity":"common","color1" : "blue","color2" : "", "energy" : "125", "health" : "30", "rarity_num" : "2"  ,"object": "Slammer" ,"foil":"0"},
  { "rarity":"common","color1" : "light blue","color2" : "", "energy" : "125", "health" : "30", "rarity_num" : "2"  ,"object": "Slammer" ,"foil":"0"},
  { "rarity":"common","color1" : "turquoise","color2" : "", "energy" : "150", "health" : "30", "rarity_num" : "2"  ,"object": "Slammer" ,"foil":"0"},
  { "rarity":"common","color1" : "green","color2" : "", "energy" : "150", "health" : "30", "rarity_num" : "2"  ,"object": "Slammer" ,"foil":"0"},

  { "rarity":"common","color1" : "blue","color2" : "light blue", "energy" : "150", "health" : "30", "rarity_num" : "3","object": "Kog" ,"foil":"1"  },
  { "rarity":"common","color1" : "turquoise","color2" : "green", "energy" : "150", "health" : "25", "rarity_num" : "3" ,"object": "Kog" ,"foil":"1" },
  { "rarity":"ultra rare","color1" : "0","color2" : "0", "energy" : "175", "health" : "25", "rarity_num" : "3" ,"object": "Kog" ,"foil":"0" },
  { "rarity":"uncommon","color1" : "0","color2" : "0", "energy" : "175", "health" : "25", "rarity_num" : "3" ,"object": "Slammer" ,"foil":"0" },
  { "rarity":"uncommon","color1" : "purple","color2" : "teal", "energy" : "150", "health" : "30", "rarity_num" : "3","object": "Kog" ,"foil":"1"   },
  { "rarity":"uncommon","color1" : "yellow","color2" : "orange", "energy" : "150", "health" : "30", "rarity_num" : "3"  ,"object": "Kog" ,"foil":"1" },
  { "rarity":"uncommon","color1" : "red","color2" : "", "energy" : "150", "health" : "30", "rarity_num" : "3"  ,"object": "Kog" ,"foil":"1" },
  { "rarity":"rare","color1" : "0","color2" : "0", "energy" : "175", "health" : "30", "rarity_num" : "3" ,"object": "Slammer" ,"foil":"0"  },
  { "rarity":"rare","color1" : "0","color2" : "0", "energy" : "175", "health" : "30", "rarity_num" : "3"  ,"object": "Kog" ,"foil":"1" },

  { "rarity":"common","color1" : "blue","color2" : "", "energy" : "200", "health" : "40", "rarity_num" : "4" ,"object": "Slammer" ,"foil":"1" },
  { "rarity":"common","color1" : "light blue","color2" : "", "energy" : "200", "health" : "40", "rarity_num" : "4" ,"object": "Slammer" ,"foil":"1" },
  { "rarity":"common","color1" : "turquoise","color2" : "", "energy" : "225", "health" : "40", "rarity_num" : "4"  ,"object": "Slammer" ,"foil":"1"},
  { "rarity":"common","color1" : "green","color2" : "", "energy" : "225", "health" : "40", "rarity_num" : "4" ,"object": "Slammer" ,"foil":"1" },
  { "rarity":"ultra rare","color1" : "0","color2" : "0", "energy" : "200", "health" : "45", "rarity_num" : "4" ,"object": "Slammer" ,"foil":"0" },
  { "rarity":"ultra rare","color1" : "0","color2" : "0", "energy" : "200", "health" : "45", "rarity_num" : "4" ,"object": "Kog" ,"foil":"1" },
  { "rarity":"uncommon","color1" : "0","color2" : "0", "energy" : "225", "health" : "45", "rarity_num" : "4" ,"object": "Slammer" ,"foil":"1" },
  { "rarity":"rare","color1" : "0","color2" : "0", "energy" : "225", "health" : "45", "rarity_num" : "4","object": "Slammer" ,"foil":"1"  },

  { "rarity":"ultra rare","min" : "0", "max" : "0", "energy" : "250", "health" : "50", "rarity_num" : "5" ,"object": "Slammer" ,"foil":"1" },
];


async function find_kogs(asset) {
  var foiled = (asset.data.foil == 'true')?1:0;
  for (let index = 0; index < kogs_stats.length; index++) {
      const element = kogs_stats[index];
      if (element.object === asset.data.object) {
          if(parseInt(element.foil) === foiled )
          {
            if(asset.data.rarity === element.rarity)
            {
              if((asset.data.border_color == element.color1)||(asset.data.border_color == element.color2)||('0' == element.color1)||('0' == element.color1))
              {
                return element;
              }
            }
          }
      } 
  }
}


async function get_table_rooms() {
    try {
        const rows = await rpc.get_table_rows({
            json: true,               // Get the response as json
            code: CONTRACT,      // Contract that we target
            scope: CONTRACT,         // Account that owns the data
            table: 'gamesrooms',        // Table name
            limit: 1000,                // Maximum number of rows that we want to get
            reverse: false,           // Optional: Get reversed data
            show_payer: false          // Optional: Show ram payer
        });
        return rows.rows;
    } catch (error) {
        console.log(error);
    }
}

async function get_table_fights(id) {
  try {
    const rows = await rpc.get_table_rows({
      json: true,               // Get the response as json
      code: CONTRACT,      // Contract that we target
      scope: CONTRACT,         // Account that owns the data
      table: 'fightlogs',        // Table name
      limit: 1000,                // Maximum number of rows that we want to get
      upper_bound: id,
      lower_bound: id,
      reverse: false,           // Optional: Get reversed data
      show_payer: false          // Optional: Show ram payer
    });
    return rows.rows[0];
  } catch (error) {
    console.log(error);
  }
}

async function get_table_uks(username) {
  try {
    const table = await rpc.get_table_rows({
      json: true,
      code: CONTRACT,
      scope: CONTRACT,
      table: 'uks',
      limit: 1,
      upper_bound: username,
      lower_bound: username,
      reverse: false,
      show_payer: false
    });
    return table.rows[0];
  } catch (error) {
    console.log(error);
  }
}

async function fight() {
  console.log("Start fight");
  var table = await get_table_rooms();
  for (let index = 0; index < table.length; index++) {
    const element = table[index];
    if (element.status == 2) {
      try {
        var fight_element = await get_table_fights(element.roomid);

        //encrypted data
        // check if data decrypted already
        // if number and != 0 - skip
        if (!isNaN(fight_element.firstuser.attacktype)) {
          if (parseInt(fight_element.firstuser.attacktype) != 0) {
            continue;
          }
        }

        if (!isNaN(fight_element.seconduser.attacktype)) {
          if (parseInt(fight_element.seconduser.attacktype) != 0) {
            continue;
          }
        }

        const firstUser = await get_table_uks(fight_element.firstuser.username);
        const user1Data = decrypt(fight_element.firstuser.attacktype, firstUser.k);

        const user1DecryptedAttack = user1Data.attack;
        const user1DecryptedBlock = user1Data.block;

        const secondUser = await get_table_uks(fight_element.seconduser.username);
        const user2Data = decrypt(fight_element.seconduser.attacktype, secondUser.k);

        const user2DecryptedAttack = user2Data.attack;
        const user2DecryptedBlock = user2Data.block;

        console.log("Fight in room " + element.roomid.toString());

        const result = await WAX.transact(
          {
            actions: [
              {
                account: CONTRACT,
                name: 'fight',
                authorization: [{
                  actor: CONTRACT,
                  permission: 'active',
                }],
                data: {
                  roomid: fight_element.roomid,
                  username1: fight_element.firstuser.username,
                  attacktype1: user1DecryptedAttack,
                  block1: user1DecryptedBlock,
                  username2: fight_element.seconduser.username,
                  attacktype2: user2DecryptedAttack,
                  block2: user2DecryptedBlock
                },
              }]
          },
          {
            blocksBehind: 3,
            expireSeconds: 30,
          });

      } catch (error) {
        console.log(error);
      }
    }

  }
}

function decrypt(encryptResponse, userPublicKey) {
  console.log("DECRYPTING: " + encryptResponse);
  console.log(encryptResponse);
  // if is Numneric - 0 - do not decript
  if (!isNaN(encryptResponse)) {
    const enc = "0-0";
    const split = enc.split('-');
    return {attack: split[0], block: split[1]}
  }

  const encryptArray = encryptResponse.split(',');

  const publicKey = ecc.PublicKey.fromString('EOS' + encryptArray[4]);
  const myPrivate = ecc.PrivateKey.fromString(serverPrivateKey);

  checkPublicKey(userPublicKey, encryptArray[4]);

  const long = new Long(Number(encryptArray[1]), Number(encryptArray[2]), false);
  const byteArray = new Uint8Array(atob(encryptArray[0]).split('').map((c) => c.charCodeAt(0)));

  const decryptedMessage = ecc.Aes.decrypt(myPrivate, publicKey, long, convertUint8ArrayToBinaryString(byteArray), Number(encryptArray[3]));

  const decoder = new StringDecoder.StringDecoder();
  const decodedMessage = decoder.write(decryptedMessage);
  const split = decodedMessage.split('-');

  return {attack: split[0], block: split[1]}
}

function convertUint8ArrayToBinaryString(array) {
  let b_str = '';
  for (let i = 0; i < array.length; i++) {
    b_str += String.fromCharCode(array[i]);
  }
  return b_str;
}

function checkPublicKey(userPublicKey, requestPublicKey) {
  console.log(userPublicKey);
  console.log(requestPublicKey);
  if (userPublicKey !== requestPublicKey) {
    throw Error('Wrong public key');
  }
}

async function endgame() {
  console.log("Delete rooms");
  try {
    const result = await WAX.transact(
      {
        actions: [
          {
            account: CONTRACT,
            name: 'cleanrooms',
            authorization: [{
              actor: CONTRACT,
              permission: 'active',
            }],
            data: {},
          }]
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
      });

  } catch (error) {
    console.log(error);
  }
}


async function get_asset_by_id(id) {
  const atomicAssetsApiUrl = 'https://wax.api.atomicassets.io/atomicassets/v1/assets/' + id.toString();
  const response = await fetch(atomicAssetsApiUrl);
  const assets = await response.json();
  return assets.data;
}

async function set_rarity(schema_name) {
  if (schema_name == 'rareheroes') {
    return '1';
  } else if (schema_name == 'epicheroes') {
    return '2';
  } else if (schema_name == 'legheroes') {
    return '3';
  } else if (schema_name == 'mythheroes') {
    return '4';
  } else if (schema_name == 'dcheroes') {
    return '5';
  }
}

//new
async function find_bch(asset) {
    for (let index = 0; index < stats.length; index++) {
        const element = stats[index];
        if (element.rarity === asset.data.rarity) {
            if ((parseInt(asset.data.cardid) >= parseInt(element.min)) && (parseInt(asset.data.cardid) <= parseInt(element.max))) {
                return element;
            }
        } 
    }
}


async function find_alien(asset) {
    for (let index = 0; index < alien_stats.length; index++) {
        const element = alien_stats[index];
        if (parseInt(element.template_id) === parseInt(asset.template.template_id)) {
            
                return element;
            
        } 
    }
}



async function find_gpk(asset) {
  var id = asset.data.cardid;
  if (asset.data.variant === "returning") {
    id = id.substring(1);
  }
  for (let index = 0; index < gpk_stats.length; index++) {
      const element = gpk_stats[index];
      if (element.schema === asset.schema.schema_name) {
          if(asset.schema.schema_name !== "crashgordon")
          {
            if (element.rarity == asset.data.variant) {
              if((parseInt(element.min) <= parseInt(id) && parseInt(id) <= parseInt(element.max))||(parseInt(element.min) === 0))
                  return element;
            }
          }
          else
          {
            if (element.rarity == asset.data.variant) {
              if(parseInt(element.min) >= parseInt(id) && asset.data.quality == element.type)
                  return element;
            }
          }
      } 
  }
}


async function find_kogs(asset) {
  var foiled = (asset.data.foil == 'true')?1:0;
  for (let index = 0; index < kogs_stats.length; index++) {
      const element = kogs_stats[index];
      if (element.object === asset.data.object) {
          if(parseInt(element.foil) === foiled )
          {
            if(asset.data.rarity === element.rarity)
            {
              if((asset.data.border_color == element.color1)||(asset.data.border_color == element.color2)||('0' == element.color1)||('0' == element.color1))
              {
                return element;
              }
            }
          }
      } 
  }
}

async function deserialize() {
    console.log("Deserialize heroes data.");
    var table = await get_table_rooms();
    for (let index = 0; index < table.length; index++) {
        const element = table[index];
        if(element.status === 101)
        {
            console.log("Deserialize heroes data in room " + element.roomid + " for status 101 and first user");
            await des1(element);
        }
        else if (element.status === 102)
        {
            console.log("Deserialize heroes data in room "+ element.roomid + " for status 102 and second user");
            await des2(element);

            if(element.heroes1.length === 0)
            {

                console.log("Deserialize heroes data in room "+element.roomid);
                await des1(element);
            }
        }
    }
}


async function des1(element) {
    
    try {
    var asset1 = await get_asset_by_id(element.nftheroes1[0]);
    var asset2 = await get_asset_by_id(element.nftheroes1[1]);
    var asset3 = await get_asset_by_id(element.nftheroes1[2]);
    var hero1 = {heroname: "",
                rarity: 0,
                energy: 0,
                health: 0};
    var hero2 = {heroname: "",
                rarity: 0,
                energy: 0,
                health: 0};
    var hero3 = {heroname: "",
                rarity: 0,
                energy: 0,
                health: 0};

    if(asset1.collection.collection_name == "darkcountryh")
    {
        hero1 = {heroname: asset1.data.name,
                rarity: await set_rarity(asset1.schema.schema_name),
                energy: parseInt(asset1.data.energy),
                health: parseInt(asset1.data.health)};
        hero2 = {heroname: asset2.data.name,
                rarity: await set_rarity(asset2.schema.schema_name),
                energy: parseInt(asset2.data.energy),
                health: parseInt(asset2.data.health)};
        hero3 = {heroname: asset3.data.name,
                rarity: await set_rarity(asset3.schema.schema_name),
                energy: parseInt(asset3.data.energy),
                health: parseInt(asset3.data.health)};
    }
    else if (asset1.collection.collection_name == "officialhero")
    {
        var cur_hero = await find_bch(asset1);
        hero1 = {heroname: asset1.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_bch(asset2);
        hero2 = {heroname: asset2.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_bch(asset3);
        hero3 = {heroname: asset3.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};
    }
    else if (asset1.collection.collection_name == "alien.worlds")
    {
        var cur_hero = await find_alien(asset1);
        hero1 = {heroname: asset1.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_alien(asset2);
        hero2 = {heroname: asset2.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_alien(asset3);
        hero3 = {heroname: asset3.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};
    }
    else if (asset1.collection.collection_name == "gpk.topps")
    {
        var cur_hero = await find_gpk(asset1);
        hero1 = {heroname: asset1.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_gpk(asset2);
        hero2 = {heroname: asset2.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_gpk(asset3);
        hero3 = {heroname: asset3.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};
    }
    else if (asset1.collection.collection_name == "kogsofficial")
    {
        var cur_hero = await find_kogs(asset1);
        hero1 = {heroname: asset1.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_kogs(asset2);
        hero2 = {heroname: asset2.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_kogs(asset3);
        hero3 = {heroname: asset3.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};
    }
    



        const result = await WAX.transact(
            {
                actions: [
                {
                    account: CONTRACT,
                    name: 'deserialize',
                    authorization: [{
                        actor: CONTRACT,
                        permission: 'active',
                    }],
                    data: {
                        username: element.username1,
                        hero1: hero1,
                        hero2: hero2,
                        hero3: hero3,
                    },
                }]
            },
            {
            blocksBehind: 3,
            expireSeconds: 30,
            });

    } catch (error) {
        console.log("ERROR des status 102 user 1")
        console.log(error);
    }
}

async function des2(element) {
    
  try {
    var asset1 = await get_asset_by_id(element.nftheroes2[0]);
    var asset2 = await get_asset_by_id(element.nftheroes2[1]);
    var asset3 = await get_asset_by_id(element.nftheroes2[2]);


    var hero1 = {heroname: "",
                rarity: 0,
                energy: 0,
                health: 0};
    var hero2 = {heroname: "",
                rarity: 0,
                energy: 0,
                health: 0};
    var hero3 = {heroname: "",
                rarity: 0,
                energy: 0,
                health: 0};

    if(asset1.collection.collection_name == "darkcountryh")
    {
        hero1 = {heroname: asset1.data.name,
                rarity: await set_rarity(asset1.schema.schema_name),
                energy: parseInt(asset1.data.energy),
                health: parseInt(asset1.data.health)};
        hero2 = {heroname: asset2.data.name,
                rarity: await set_rarity(asset2.schema.schema_name),
                energy: parseInt(asset2.data.energy),
                health: parseInt(asset2.data.health)};
        hero3 = {heroname: asset3.data.name,
                rarity: await set_rarity(asset3.schema.schema_name),
                energy: parseInt(asset3.data.energy),
                health: parseInt(asset3.data.health)};
    }
    else if (asset1.collection.collection_name == "officialhero")
    {
        var cur_hero = await find_bch(asset1);
        hero1 = {heroname: asset1.data.name,
            rarity: parseInt(cur_hero.rarity),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_bch(asset2);
        hero2 = {heroname: asset2.data.name,
            rarity: parseInt(cur_hero.rarity),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_bch(asset3);
        hero3 = {heroname: asset3.data.name,
            rarity: parseInt(cur_hero.rarity),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};
    }
    else if (asset1.collection.collection_name == "alien.worlds")
    {
        var cur_hero = await find_alien(asset1);
        hero1 = {heroname: asset1.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_alien(asset2);
        hero2 = {heroname: asset2.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_alien(asset3);
        hero3 = {heroname: asset3.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};
    }
    else if (asset1.collection.collection_name == "gpk.topps")
    {
        var cur_hero = await find_gpk(asset1);
        hero1 = {heroname: asset1.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_gpk(asset2);
        hero2 = {heroname: asset2.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_gpk(asset3);
        hero3 = {heroname: asset3.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};
    }
    else if (asset1.collection.collection_name == "kogsofficial")
    {
        var cur_hero = await find_kogs(asset1);
        hero1 = {heroname: asset1.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_kogs(asset2);
        hero2 = {heroname: asset2.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};

        cur_hero = await find_kogs(asset3);
        hero3 = {heroname: asset3.data.name,
            rarity: parseInt(cur_hero.rarity_num),
            energy: parseInt(cur_hero.energy),
            health: parseInt(cur_hero.health)};
    }
    

        const result = await WAX.transact(
            {
                actions: [
                {
                    account: CONTRACT,
                    name: 'deserialize',
                    authorization: [{
                        actor: CONTRACT,
                        permission: 'active',
                    }],
                    data: {
                        username: element.username2,
                        hero1: hero1,
                        hero2: hero2,
                        hero3: hero3,
                    },
                }]
                },
            {
                blocksBehind: 3,
                expireSeconds: 30,
            });

    } catch (error) {
        console.log("ERROR des status 102 user 2")
        console.log(error);
    }
}


const job_fight = new CronJob({
  cronTime: "0-59/5 * * * * *",
  onTick: async () => {
    if (job_fight.taskRunning) {
      return;
    }

    job_fight.taskRunning = true;
    try {
      console.log("Checking for new packlogs logs...");
      await fight();
    } catch (err) {
      console.log("job failed: check for fights");
      console.log(err);
    }
    job_fight.taskRunning = false;
  },
  start: true,
  timeZone: "UTC"
});

const job_delete_room = new CronJob({
  cronTime: "0-59/2 * * * *",
  onTick: async () => {
    if (job_delete_room.taskRunning) {
      return;
    }

    job_delete_room.taskRunning = true;
    try {
      console.log("Checking for new packlogs logs...");
      await endgame();
    } catch (err) {
      console.log("job failed: check for delete");
      console.log(err);
    }
    job_delete_room.taskRunning = false;
  },
  start: true,
  timeZone: "UTC"
});


const job_deserialize = new CronJob({
  cronTime: "0-59/5 * * * * *",
  onTick: async () => {
    if (job_deserialize.taskRunning) {
      return;
    }

    job_deserialize.taskRunning = true;
    try {
      console.log("Checking for new packlogs logs...");
      await deserialize();
    } catch (err) {
      console.log("job failed: check for des");
      console.log(err);
    }
    job_deserialize.taskRunning = false;
  },
  start: true,
  timeZone: "UTC"
});

