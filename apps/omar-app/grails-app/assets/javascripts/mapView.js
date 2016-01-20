//= require webjars/openlayers/3.11.1/ol.js
//= require_self

var MapView = (function ()
{
    function init()
    {
        var layers = [
            //new ol.layer.Tile( {
            //    source: new ol.source.TileWMS( {
            //        url: 'http://demo.boundlessgeo.com/geoserver/wms',
            //        params: {
            //            LAYERS: 'ne:NE1_HR_LC_SR_W_DR'
            //        }
            //    } )
            //} ),
            new ol.layer.Tile( {
                source: new ol.source.TileWMS( {
                    url: '/o2/wms/getMap',
                    params: {
                        VERSION: '1.1.1',
                        LAYERS: 'omar:raster_entry',
                        FORMAT: 'image/jpeg'
                    }
                } )
            } ),
            new ol.layer.Tile( {
                source: new ol.source.TileWMS( {
                    url: '/o2/footprints/getFootprints',
                    params: {
                        FILTER: "file_type='nitf'",
                        VERSION: '1.1.1',
                        LAYERS: 'omar:raster_entry',
                        STYLES: 'byFileType'
                    }
                } )
            } )
        ];

        var map = new ol.Map( {
            controls: ol.control.defaults().extend( [
                new ol.control.ScaleLine( {
                    units: 'degrees'
                } )
            ] ),
            layers: layers,
            target: 'map',
            view: new ol.View( {
                projection: 'EPSG:4326',
                center: [0, 0],
                zoom: 2
            } )
        } );
    }

    return {
        init: init
    }
})();
