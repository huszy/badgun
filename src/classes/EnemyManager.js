const ENEMY_DEFINITIONS = [
  {
    name: "beetle"
  },
  'BUGGY': {

  }
]
export default class EnemyManager {
  
  static getDefinitionByName (name) {
    return ENEMY_DEFINITIONS[name]
  }
}
