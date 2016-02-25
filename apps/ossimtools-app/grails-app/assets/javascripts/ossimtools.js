//= require jquery-2.1.3.js
//= require webjars/bootswatch-superhero/3.3.5/js/bootstrap.js
//= require webjars/openlayers/3.13.0/ol.js
//= require_self

ossimtools = (function ()
{
    "use strict";

    var center_lat, center_lon, radiusROI, 
        radiusLZ, roughness, slope,
        fovStart, fovStop, heightOfEye,
        gainFactor, 
        sunAz, sunElev,
        map, layers;


    function updateHLZ()
    {
        map.getLayers().forEach( function ( layer )
        {
            if ( layer.get( 'name' ) == 'hlz' )
            {
                // Do with layer
                var source = layer.getSource();
                var params = source.getParams();
                params.lat = lat;
                params.lon = lon;
                params.radiusROI = radiusROI;
                params.radiusLZ = radiusLZ;
                params.roughness = roughness;
                params.slope = slope;
                source.updateParams( params );
            }
        } );
    }

    function updateViewshed()
    {
        map.getLayers().forEach( function ( layer )
        {
            if ( layer.get( 'name' ) == 'viewshed' )
            {
                // Do with layer
                var source = layer.getSource();
                var params = source.getParams();
                params.lat = lat;
                params.lon = lon;
                params.radiusROI = radiusROI;
                params.fovStart = fovStart;
                params.fovStop = fovStop;
                params.heightOfEye = heightOfEye;
                source.updateParams( params );
            }
        } );
    }

    function updateSlope()
    {
        map.getLayers().forEach( function ( layer )
        {
            if ( layer.get( 'name' ) == 'slope' )
            {
                // Do with layer
                var source = layer.getSource();
                var params = source.getParams();
                params.lat = lat;
                params.lon = lon;
                params.radiusROI = radiusROI;
                params.gainFactor = gainFactor;
                source.updateParams( params );
            }
        } );
    }

    function updateHillshade()
    {
        map.getLayers().forEach( function ( layer )
        {
            if ( layer.get( 'name' ) == 'hillshade' )
            {
                // Do with layer
                var source = layer.getSource();
                var params = source.getParams();
                params.lat = lat;
                params.lon = lon;
                params.radiusROI = radiusROI;
                params.sunAz = sunAz;
                params.sunEl = sunEl;
                source.updateParams( params );
            }
        } );
    }

    function toggleLayer( name, status )
    {
        console.log( name, status );

        map.getLayers().forEach( function ( layer )
        {
            if ( layer.get( 'name' ) === name )
            {
                layer.set( 'visible', status );
            }
        } );
    }

    function setOverlayOpacity( name, value )
    {
        map.getLayers().forEach( function ( layer )
        {
            if ( layer.get( 'name' ) === name )
            {
                layer.setOpacity( value );
            }
        } );
    }

    function onMoveEnd( evt )
    {
         var center = ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326')

        //console.log( center );

        lat = center[1];
        lon = center[0];

        $( '#lat' ).val( lat );
        $( '#lon' ).val( lon );

        updateHLZ();
        updateViewshed();
        updateSlope();
        updateHillshade();

    }

    function initialize( initParams )
    {
        lat = initParams.lat;
        lon = initParams.lon;
        radiusROI = initParams.radiusROI;

        radiusLZ = initParams.radiusLZ;
        //roughness = initParams.roughness;
        slope = initParams.slope;

        fovStart = initParams.fovStart;
        fovStop = initParams.fovStop;
        heightOfEye = initParams.heightOfEye;

        layers = [
            new ol.layer.Tile( {
                name: 'reference',
                source: new ol.source.TileWMS( {
                    url: 'http://geoserver-demo01.dev.ossim.org/geoserver/ged/wms?',
                    params: {
                        LAYERS: 'osm-group'
                    }
                } )
            } ),
            new ol.layer.Image( {
                name: 'hlz',
                source: new ol.source.ImageWMS( {
                    url: '/hlz/renderHLZ',
                    params: {
                        LAYERS: '',
                        VERSION: '1.1.1',
                        lat: lat,
                        lon: lon,
                        radiusROI: radiusROI,
                        radiusLZ: radiusLZ,
                        roughness: roughness,
                        slope: slope
                    }
                } )
            } ),
            new ol.layer.Image( {
                name: 'ovs',
                source: new ol.source.ImageWMS( {
                    url: '/hlz/renderViewshed',
                    params: {
                        LAYERS: '',
                        VERSION: '1.1.1',
                        lat: lat,
                        lon: lon,
                        radius: radiusROI,
                        fovStart: fovStart,
                        fovStop: fovStop,
                        heightOfEye: heightOfEye
                    }
                } )
            } )
            new ol.layer.Tile( {
                name: 'slope',
                source: new ol.source.TileWMS( {
                    url: '/hlz/renderSlope',
                    params: {
                        VERSION: '1.1.1'
                    }
                } )
            } ),
            new ol.layer.Tile( {
                name: 'hillshade',
                source: new ol.source.TileWMS( {
                    url: '/hlz/renderHillShade',
                    params: {
                        VERSION: '1.1.1'
                    }
                } )
            } )
        ];

        map = new ol.Map( {
            controls: ol.control.defaults().extend( [
                new ol.control.ScaleLine( {
                    units: 'degrees'
                } )
            ] ),
            layers: layers,
            target: 'map',
            view: new ol.View( {
                projection: 'EPSG:4326'//,
                //center: [initParams.lon, initParams.lat],
                //zoom: 2
            } )
        } );

        map.on( 'moveend', onMoveEnd );
        var extent = ol.extent.boundingExtent( initParams.extent );
        //console.log( extent );
        map.getView().fit( extent, map.getSize() );

        $( '#lat' ).val( lat );
        $( '#lon' ).val( lon );
        $( '#radiusROI' ).val( radiusROI );
        $( '#radiusLZ' ).val( radiusLZ );
        $( '#roughness' ).val( roughness );
        $( '#slope' ).val( slope );
        $( '#fovStart' ).val( fovStart );
        $( '#fovStop' ).val( fovStop );
        $( '#heightOfEye' ).val( heightOfEye );
        $( '#gainFactor' ).val( gainFactor );
        $( '#sunAz' ).val( sunAz );
        $( '#sunEl' ).val( sunEl );

        $( '#toggleHLZ' ).click( function ()
        {
            var $this = $( this );
            // $this will contain a reference to the checkbox
            if ( $this.is( ':checked' ) )
            {
                // the checkbox was checked
                toggleLayer( 'hlz', true );
            }
            else
            {
                // the checkbox was unchecked
                toggleLayer( 'hlz', false );
            }
        } );

        $( '#toggleViewshed' ).click( function ()
        {
            var $this = $( this );
            // $this will contain a reference to the checkbox
            if ( $this.is( ':checked' ) )
            {
                // the checkbox was checked
                toggleLayer( 'viewshed', true );
            }
            else
            {
                // the checkbox was unchecked
                toggleLayer( 'viewshed', false );
            }
        } );

        $( '#toggleSlope' ).click( function ()
        {
            var $this = $( this );
            // $this will contain a reference to the checkbox
            if ( $this.is( ':checked' ) )
            {
                // the checkbox was checked
                toggleLayer( 'slope', true );
            }
            else
            {
                // the checkbox was unchecked
                toggleLayer( 'slope', false );
            }
        } );


        $( '#toggleHillshade' ).click( function ()
        {
            var $this = $( this );
            // $this will contain a reference to the checkbox
            if ( $this.is( ':checked' ) )
            {
                // the checkbox was checked
                toggleLayer( 'hillshade', true );
            }
            else
            {
                // the checkbox was unchecked
                toggleLayer( 'hillshade', false );
            }
        } );


        $( '#submitButton' ).on( 'click', function ( e )
        {
            // Common Parameters:
            lat = $( '#lat' ).val();
            lon = $( '#lon' ).val();
            radiusROI = $( '#radiusROI' ).val();

            // HLZ Parameters:
            radiusLZ = $( '#rlz' ).val();
            roughness = $( '#roughness' ).val();
            slope = $( '#slope' ).val();

            // Viewshed Parameters:

            fovStart = $( '#fovStart' ).val();
            fovStop = $( '#fovStop' ).val();
            heightOfEye = $( '#heightOfEye' ).val();

            // Slope Parameters:
            gainFactor = $( '#gainFactor' ).val();
            
            // Hillshade Parameters:
            sunAz = $( '#sunAz' ).val();
            sunEl = $( '#sunEl' ).val();
            
            
            // Pass the request to OSSIM:
            updateLayers();
            updateViewshed();
            updateSlope();
            updateHillshade();
            
            map.getView().setCenter( ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857') );

        } );

        setOverlayOpacity( 'hlz', 0.5 );
        setOverlayOpacity( 'viewshed', 0.5 );
        setOverlayOpacity( 'slope', 0.5 );
        setOverlayOpacity( 'hillshade', 0.5 );

    }

    return {
        initialize: initialize
    };
})();