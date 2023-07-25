/* @preserve
 * A JS SDK for NBN Atlas. https://nbnatlas.org/
 * Author: Helen Manders-Jones helenmandersjones@gmail.com
 */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).NBNAtlas={})}(this,(function(e){"use strict";async function t(e){const t=new AbortController;setTimeout((()=>t.abort()),1e4);const s=await fetch(e,{signal:t.signal});if(s.status>=400)return Promise.reject({status:s.status,message:s.statusText,body:s.data});if(s.status>=200&&s.status<=202){return await s.json()}return{}}function s(e,t=" OR "){return e.map((e=>encodeURIComponent('"'+e+'"'))).join("OR")}const i={URL_RECORDS_WS:"https://records-ws.nbnatlas.org",URL_SPECIES_WS:"https://species-ws-dev.nbnatlas.org",URL_LISTS_WS:"https://lists.nbnatlas.org"},c={BEAUTIFUL_BURIAL_GROUNDS:"cl273"},a={BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE:"dr2504",BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE:"dr2492",SENSITIVE_IN_ENGLAND:"dr2058",SENSITIVE_IN_WALES:"dr2067"};class n{async getBBGPlace(e){let t=this._buildGetPlaceUrl(e),s=await this._getJson(t);return this._buildBBGPlaceDTO(s)}async getBBGPlacesForAssetID(e){let t=`${i.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=assetid_s:${e}`,s=await this._getJson(t);return this._buildBBGAssetDTO(s)}_buildBBGPlaceDTO(e){let t=e.searchResults&&e.searchResults.results&&e.searchResults.results[0]?e.searchResults.results[0]:null;return t?{assetID:t.assetid_s,name:t.bbg_name_s}:[]}_buildBBGAssetDTO(e){let t=e.searchResults&&e.searchResults.results&&e.searchResults.results.length>0?e.searchResults.results:null;return t?{assetID:t[0].assetid_s,assetName:t[0].name_s,places:t.map((e=>e.bbg_name_s))}:{}}_buildGetPlaceUrl(e){return`${i.URL_SPECIES_WS}/search?fq=idxtype:REGIONFEATURED&fq=name:${encodeURIComponent('"'+e+'"')}`}_getJson(e){return t(e)}}const r="Missing place name",o="Missing species list id",u="Missing asset id";function l(e){return Promise.reject({status:"INVALID",message:e})}class d{async getSpeciesCountByGroup({layerId:e,placeNames:t}){let c=`${i.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${e}:(${s(t)})&fq=-occurrence_status:absent`,a=await this._getJson(c);return this._buildSpeciesCountByGroupDTO(a)}async getSpeciesCountByGroupForSpeciesList({layerId:e,placeNames:t,speciesListId:c}){let a=`${i.URL_RECORDS_WS}/explore/groups?q=*:*&fq=${e}:(${s(t)})&fq=-occurrence_status:absent`;a=`${a}&fq=species_list_uid:${c}`;let n=await this._getJson(a);return this._buildSpeciesCountByGroupDTO(n)}async getOccurrenceCount({layerId:e,placeNames:t}){const c=`${i.URL_RECORDS_WS}/occurrences/search?q=${e}:(${s(t)})&facets=names_and_lsid&pageSize=1&flimit=-1\n                                &fq=-occurrence_status:absent&sort=year&dir=desc&fl=year`,a=await this._getJson(c),n=this._buildOccurrenceCountDTO(a);if(n.length){await this._addLastOccurrenceYear({layerId:e,placeNames:t,speciesListId:void 0,occurrenceCountDTO:n});const s=await this._getBatOccurrenceCount({layerId:e,placeNames:t});n.push(s)}return n}async getOccurrenceCountForSpeciesList({layerId:e,placeNames:t,speciesListId:c}){const a=`${i.URL_RECORDS_WS}/occurrences/search?q=${e}:(${s(t)})&facets=names_and_lsid&pageSize=1&flimit=-1\n                            &fq=-occurrence_status:absent&fq=species_list_uid:${c}&sort=year&dir=desc&fl=year`,n=await this._getJson(a),r=this._buildOccurrenceCountDTO(n);if(r.length){await this._addLastOccurrenceYear({layerId:e,placeNames:t,speciesListId:c,occurrenceCountDTO:r});const s=await this._getBatOccurrenceCount({layerId:e,placeNames:t});r.push(s)}return r}async _getBatOccurrenceCount({layerId:e,placeNames:t}){const c=`${i.URL_RECORDS_WS}/occurrences/search?q=${e}:(${s(t)})&fq=lsid:NHMSYS0000376160\n                            &fq=occurrence_status:present&pageSize=1&sort=year&dir=desc`,a=await this._getJson(c);return a.occurrences.length?{count:a.totalRecords,year:a.occurrences[0].year,additional:{scientificName:"Chiroptera",commonName:"Bat",taxonGuid:"NHMSYS0020001355"}}:{count:0,year:0,additional:{scientificName:"Chiroptera",commonName:"Bat",taxonGuid:"NHMSYS0020001355"}}}_buildSpeciesCountByGroupDTO(e){return e}_buildOccurrenceCountDTO(e){return e.facetResults&&e.facetResults[0]&&e.facetResults[0].fieldResult?e.facetResults[0].fieldResult.map((e=>{const t=e.label.split("|");return{...e,year:0,additional:{scientificName:t[0],commonName:t[2],taxonGuid:t[1]}}})):[]}async _addLastOccurrenceYear({layerId:e,placeNames:t,speciesListId:c,occurrenceCountDTO:a}){const n="("+a.map((e=>e.additional.taxonGuid)).join(" OR ")+")",r=`${i.URL_RECORDS_WS}/occurrences/search?q=${e}:(${s(t)})&pageSize=20000\n                                &fq=-occurrence_status:absent&fq=taxon_concept_lsid:${n}&sort=year&dir=desc&fl=year,taxon_concept_lsid`+(c?`&fq=species_list_uid:${c}`:""),o=await this._getJson(r),u=Object.values(o.occurrences.reduce(((e,t)=>{const{taxonConceptID:s,year:i}=t;return(!e[s]||i>e[s].year)&&(e[s]={taxonConceptID:s,year:i}),e}),{}));return a.forEach((e=>{const t=u.find((t=>t.taxonConceptID===e.additional.taxonGuid));t&&(e.year=t.year)})),a}_getJson(e){return t(e)}}class p{async getSpeciesList(e){let s=`${i.URL_LISTS_WS}/ws/speciesListItems/${e}`,c=await t(s);return this._buildSpeciesListDTO(c)}_buildSpeciesListDTO(e){return e}}class _{constructor(e){this.layerId=e,this.recordsWS=new d,this.listsWS=new p}async getSpeciesCountByGroup(e,t){if(!e||!e.length)return l(r);const s=await this.recordsWS.getSpeciesCountByGroup({layerId:this.layerId,placeNames:e});let i=t?await this.recordsWS.getSpeciesCountByGroupForSpeciesList({layerId:this.layerId,placeNames:e,speciesListId:t}):[];return this._buildSpeciesCountByGroupResult(s,i)}async getOccurrenceCount(e){if(!e)return l(r);let t=[];const s=await this.recordsWS.getOccurrenceCount({layerId:this.layerId,placeNames:e});if(s){const e=await this.listsWS.getSpeciesList(a.SENSITIVE_IN_WALES),i=await this.listsWS.getSpeciesList(a.SENSITIVE_IN_ENGLAND);t=this._buildOccurrenceCountResult(s,e,i)}return t}async getOccurrenceCountForSpeciesList(e,t){if(!e)return l(r);if(!t)return l(o);const s=await this.listsWS.getSpeciesList(t);let i=[];const c=await this.recordsWS.getOccurrenceCountForSpeciesList({layerId:this.layerId,placeNames:e,speciesListId:t});if(c&&c.length){const e=await this.listsWS.getSpeciesList(a.SENSITIVE_IN_WALES),t=await this.listsWS.getSpeciesList(a.SENSITIVE_IN_ENGLAND);i=this._buildOccurrenceCountForSpeciesListResult(s,c,e,t)}return i}_buildSpeciesCountByGroupResult(e,t){const s=new Map;return e.forEach((e=>s.set(e.name,{speciesGroup:e.name,speciesCount:e.speciesCount,selectedSpeciesCount:0}))),t.forEach((e=>{let t=s.get(e.name);t?t={...t,selectedSpeciesCount:e.speciesCount}:s.set(e.name,{speciesGroup:e.name,speciesCount:0,selectedSpeciesCount:e.speciesCount})})),[...s.values()]}_buildOccurrenceCountResult(e,t,s){if(!e)return{};const i=this._sensitiveSpeciesJSONToMap(t),c=this._sensitiveSpeciesJSONToMap(s);return e.map((e=>({scientificName:e.additional.scientificName,commonName:e.additional.commonName,taxonGuid:e.additional.taxonGuid,count:e.count,sensitiveInEngland:!!i[e.additional.taxonGuid],sensitiveInWales:!!c[e.additional.taxonGuid]})))}_buildOccurrenceCountForSpeciesListResult(e,t,s,i){if(!t||0===t.length)return{};const c=this._sensitiveSpeciesJSONToMap(s),a=this._sensitiveSpeciesJSONToMap(i),n=e.map((e=>{let s=this._getOccurrenceCountAndLastRecorded(e.lsid,t);return{scientificName:e.scientificName,commonName:e.commonName,taxonGuid:e.lsid,lastRecorded:s.lastRecorded,count:s.count,sensitiveInEngland:!!c[e.lsid],sensitiveInWales:!!a[e.lsid]}})),r=t[t.length-1];return"Chiroptera"===r.additional.scientificName&&n.push({scientificName:r.additional.scientificName,commonName:r.additional.commonName,taxonGuid:r.additional.taxonGuid,lastRecorded:r.year,count:r.count,sensitiveInEngland:!0,sensitiveInWales:!1}),n}_getOccurrenceCountAndLastRecorded(e,t){let s={count:0,lastRecorded:0};return t.some((t=>t.additional.taxonGuid===e&&(s={count:t.count,lastRecorded:t.year},!0))),s}_sensitiveSpeciesJSONToMap(e){return e.reduce(((e,t)=>(e[t.lsid]=t,e)),{})}}class S{constructor(){this.places=new _(c.BEAUTIFUL_BURIAL_GROUNDS),this.speciesWS=new n}async getSeekAdviceData(e){return e?this.places.getOccurrenceCountForSpeciesList([e],a.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE):l(r)}async getSeekAdviceDataForAssetID(e){if(!e)return l(u);let t=await this.speciesWS.getBBGPlacesForAssetID(e);return this.places.getOccurrenceCountForSpeciesList(t.places,a.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE)}async getDigestTableData(e){return e?this.places.getSpeciesCountByGroup([e],a.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE):l(r)}async getDigestTableDataForAssetID(e){if(!e)return l(u);let t=await this.speciesWS.getBBGPlacesForAssetID(e);return this.places.getSpeciesCountByGroup(t.places,a.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE)}async getPlace(e){return e?this.speciesWS.getBBGPlace(e):l(r)}}const I=new S;e.BBG=S,e.CONFIG=i,e.LAYERS=c,e.Places=_,e.SPECIES_LIST=a,e.bbg=I,e.places=function(e){return new _(e)},Object.defineProperty(e,"__esModule",{value:!0});var h=window.NBNAtlas;e.noConflict=function(){return window.NBNAtlas=h,this},window.NBNAtlas=e}));
//# sourceMappingURL=nbnatlas-sdk.js.map
