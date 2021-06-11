import { getJson } from '../util/index'
import { CONFIG } from '../config/index'

/**
* @private
*/
export class ListsWS {

    async getSpeciesList(speciesListId) {
        let url = `${CONFIG.URL_LISTS_WS}/ws/speciesListItems/${speciesListId}`;
        let json = await getJson(url);
        return this._buildSpeciesListDTO(json);
    }


    /**
    * @private
    */
    _buildSpeciesListDTO(json) {
        return json;
    }

}