import sinon from 'sinon';
import { expect, assert } from 'chai'
import { Places } from '../../src/core/places.js'
import {ERROR_MESSAGES} from '../../src/validation/index.js'


let places;

describe('places', function () {
    before(function () {
        places = new Places("LAYER_ID");
    });

    describe('getSpeciesCountByGroup(placeName)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_PLACE_NAME', async function () {
                try {
                    await places.getSpeciesCountByGroup();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID");
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_PLACE_NAME)
                }

            })
        })

        context('with placeName argument and no species list id argument', function () {
            it('should build result with empty selected species count', async function () {
                const recordsWS_getSpeciesCountByGroupStub = sinon.stub(places.recordsWS, "getSpeciesCountByGroup").returns([1]);
                const places_buildSpeciesCountByGroupResultStub = sinon.stub(places, "_buildSpeciesCountByGroupResult");
                
                await places.getSpeciesCountByGroup("place");
                
                assert(recordsWS_getSpeciesCountByGroupStub.calledOnce);
                assert(recordsWS_getSpeciesCountByGroupStub.calledWith, sinon.match({ layerId: 'LAYTER_ID',  placeName:'place'}));
               
                sinon.assert.calledWith(places_buildSpeciesCountByGroupResultStub,[1], []); 

                recordsWS_getSpeciesCountByGroupStub.restore();  
                places_buildSpeciesCountByGroupResultStub.restore();        
            })
        })

        context('with placeName and species list arguments', function () {
            it('should build result with empty selected species count', async function () {
                const recordsWS_getSpeciesCountByGroupStub = sinon.stub(places.recordsWS, "getSpeciesCountByGroup").returns([1]);
                const recordsWS_getSpeciesCountByGroupForSpeciesListStub = sinon.stub(places.recordsWS, "getSpeciesCountByGroupForSpeciesList").returns([2]);
                const places_buildSpeciesCountByGroupResultStub = sinon.stub(places, "_buildSpeciesCountByGroupResult");
                
                await places.getSpeciesCountByGroup("place", "SPECIES_LIST_ID");
                
                assert(recordsWS_getSpeciesCountByGroupStub.calledOnce);
                assert(recordsWS_getSpeciesCountByGroupStub.calledWith, sinon.match({ layerId: 'LAYTER_ID',  placeName:'place'}));

                assert(recordsWS_getSpeciesCountByGroupForSpeciesListStub.calledOnce);
                assert(recordsWS_getSpeciesCountByGroupForSpeciesListStub.calledWith, sinon.match({ layerId: 'LAYTER_ID',  placeName:'place', speciesListId:"SPECIES_LIST_ID"}));
               
                sinon.assert.calledWith(places_buildSpeciesCountByGroupResultStub,[1], [2]); 

                recordsWS_getSpeciesCountByGroupStub.restore();  
                recordsWS_getSpeciesCountByGroupForSpeciesListStub.restore();
                places_buildSpeciesCountByGroupResultStub.restore();        
            })
        })


    });

   


    

});