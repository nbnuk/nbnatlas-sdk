import { getJson } from '../util/index.js'
import { CONFIG } from '../config/index.js'

/**
* @private
*/
export class SpeciesWS {

    async getBBGPlace(placeName) {
        let url = this._buildGetPlaceUrl(placeName);
        let json = await this._getJson(url);
        return this._buildBBGPlaceDTO(json);
    }


    async getBBGPlacesForAssetID(assetID) {
        let url = `${CONFIG.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=id_s:${assetID}`;;
        let json = await this._getJson(url);
        return this._buildBBGAssetDTO(json);
    }



    /**
      * @private
      */
    _buildBBGPlaceDTO(json) {
        //let result = json.searchResults?.results?.[0];
        let result = json.searchResults && json.searchResults.results && json.searchResults.results[0] ?
            json.searchResults.results[0] : null;
        return result ? {
            assetID: result.id_s,
            name: result.bbg_name_s
        }
            : [];
    }

    _buildBBGAssetDTO(json) {
        //let result = json.searchResults?.results?.[0];
        let result = json.searchResults && json.searchResults.results && json.searchResults.results.length>0 ?
            json.searchResults.results : null;
        return result ? {
                assetID:result[0].id_s,
                assetName:result[0].name_s,
                places:result.map(it=>it.bbg_name_s)
            }
            : {};
    }

    /**
      * @private
      */
    _buildGetPlaceUrl(placeName) {
        return `${CONFIG.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=name:${encodeURIComponent('"' + placeName + '"')}`;
    }


    /** @private */
    _getJson(url) {
        return getJson(url)
    }

}

