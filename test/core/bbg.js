import sinon from 'sinon';
import { expect, assert } from 'chai'
import { SPECIES_LIST } from '../../src/config/index.js'
import { BBG } from '../../src/core/bbg.js'
import {ERROR_MESSAGES} from '../../src/validation/index.js'


let bbg;

describe('bbg', function () {
    before(function () {
        bbg = new BBG();
    });

    describe('getPlace(placeName)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_PLACE_NAME', async function () {
                try {
                    await bbg.getPlace();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID")
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_PLACE_NAME)
                }

            })
        })

        context('with placeName argument', function () {
            it('should call correct webservice', async function () {
                const speciesWSStub = sinon.stub(bbg.speciesWS, "getBBGPlace");
                await bbg.getPlace("place");
                sinon.assert.calledWith(speciesWSStub,"place");
                speciesWSStub.restore();          
            })
        })


    });

    describe('getDigestTableData(placeName)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_PLACE_NAME', async function () {
                try {
                    await bbg.getDigestTableData();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID");
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_PLACE_NAME)
                }

            })
        })

        context('with placeName argument', function () {
            it('should call correct web service', async function () {
                const stub = sinon.stub(bbg.places, "getSpeciesCountByGroup");
                await bbg.getDigestTableData("place");
                sinon.assert.calledWith(stub,["place"], SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE);
                stub.restore();       
            })
        })


    });

    describe('getDigestTableDataForAssetID(assetID)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_ASSET_ID', async function () {
                try {
                    await bbg.getDigestTableDataForAssetID();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID");
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_ASSET_ID)
                }

            })
        })

        context('with assetID argument', function () {
            it('should call correct web service', async function () {
                const stub1 = sinon.stub(bbg.speciesWS, "getBBGPlacesForAssetID").callsFake(()=>{return {places:["place1","place2"]}});
                const stub2 = sinon.stub(bbg.places, "getSpeciesCountByGroup");
                await bbg.getDigestTableDataForAssetID("assetID");
                sinon.assert.calledWith(stub1,"assetID");
                sinon.assert.calledWith(stub2,["place1","place2"], SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_DIGEST_TABLE);
                stub1.restore();
                stub2.restore();
            })
        })


    });


    describe('getSeekAdviceData(placeName)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_PLACE_NAME', async function () {
                try {
                    await bbg.getSeekAdviceData();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID")
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_PLACE_NAME)
                }

            })
        })

        context('with placeName argument', function () {
            it('should call correct web service', async function () {
                const stub = sinon.stub(bbg.places, "getOccurrenceCountForSpeciesList");
                await bbg.getSeekAdviceData("place");
                sinon.assert.calledWith(stub,["place"], SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE);
                stub.restore();       
            })
        })


    });

    describe('getSeekAdviceDataForAssetID(assetID)', function () {

        context('without arguments', function () {
            it('should reject with MISSING_ASSET_ID', async function () {
                try {
                    await bbg.getSeekAdviceDataForAssetID();
                }
                catch (error) {
                    expect(error.status).to.be.equal("INVALID")
                    expect(error.message).to.be.equal(ERROR_MESSAGES.MISSING_ASSET_ID)
                }

            })
        })

        context('with placeName argument', function () {
            it('should call correct web service', async function () {
                const stub1 = sinon.stub(bbg.speciesWS, "getBBGPlacesForAssetID").callsFake(()=>{return {places:["place1","place2"]}});
                const stub2 = sinon.stub(bbg.places, "getOccurrenceCountForSpeciesList");
                await bbg.getSeekAdviceDataForAssetID("assetID");
                sinon.assert.calledWith(stub1,"assetID");
                sinon.assert.calledWith(stub2,["place1","place2"], SPECIES_LIST.BEAUTIFUL_BURIAL_GROUNDS_SEEK_ADVICE);
                stub1.restore();
                stub2.restore();
            })
        })


    });


    

});