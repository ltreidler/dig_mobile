//for converting neo4j dog objects
function parseTraits(record) {

      const traits = record.get('traits');
      const all_traits = {};
      for(let i = 0; i < traits.length; i++) {
          all_traits[record.get('trait_labels')[i].toLowerCase()] = traits[i];
      }
      return all_traits;

}

module.exports = parseTraits;