package omar.wfs

import omar.core.BindUtil

class WfsController
{
  def webFeatureService

  static defaultAction = "index"


  def index()
  {
    def wfsParams = params - params.subMap( ['controller', 'format', 'action'] )
    def op = wfsParams.find { it.key.equalsIgnoreCase( 'request' ) }

    switch ( request?.method?.toUpperCase() )
    {
    case 'GET':
      op = wfsParams.find { it.key.equalsIgnoreCase( 'request' ) }?.value
      break
    case 'POST':
      op = request?.XML?.name()
      break
    }

    def results

//    println wfsParams

//    println '*' * 40
//    println op

    switch ( op?.toUpperCase() )
    {
    case "GETCAPABILITIES":
//      println 'GETCAPABILITIES'
//      forward action: 'getCapabilities'

      def cmd = new GetCapabilitiesRequest()

      switch ( request?.method?.toUpperCase() )
      {
      case 'GET':
        BindUtil.fixParamNames( GetCapabilitiesRequest, wfsParams )
        bindData( cmd, wfsParams )
        break
      case 'POST':
        cmd = cmd.fromXML( request.XML )
        break
      }

      results = webFeatureService.getCapabilities( cmd )
      break
    case "DESCRIBEFEATURETYPE":
//      println 'DESCRIBEFEATURETYPE'
//      forward action: 'describeFeatureType'

      def cmd = new DescribeFeatureTypeRequest()

      switch ( request?.method?.toUpperCase() )
      {
      case 'GET':
        BindUtil.fixParamNames( DescribeFeatureTypeRequest, wfsParams )
        bindData( cmd, wfsParams )
        break
      case 'POST':
        cmd = cmd.fromXML( request.XML )
        break
      }

      results = webFeatureService.describeFeatureType( cmd )
      break
    case "GETFEATURE":
//      println 'GETFEATURE'
//      forward action: 'getFeature'

      def cmd = new GetFeatureRequest()

      switch ( request?.method?.toUpperCase() )
      {
      case 'GET':
        BindUtil.fixParamNames( GetFeatureRequest, wfsParams )
        bindData( cmd, wfsParams )
        break
      case 'POST':
        cmd = cmd.fromXML( request.XML )
        break
      }

      results = webFeatureService.getFeature( cmd )
      break
    default:
      println 'UNKNOWN'
      break

    }

//    println '*' * 40

    render contentType: results.contentType, text: results.buffer
  }

  def getCapabilities(GetCapabilitiesRequest wfsParams)
  {
    def results = webFeatureService.getCapabilities( wfsParams )

    render contentType: results.contentType, text: results.buffer
  }

  def describeFeatureType(DescribeFeatureTypeRequest wfsParams)
  {
    def results = webFeatureService.describeFeatureType( wfsParams )

    render contentType: results.contentType, text: results.buffer
  }

  def getFeature(GetFeatureRequest wfsParams)
  {
//    println wfsParams

    def results = webFeatureService.getFeature( wfsParams )

    render contentType: results.contentType, text: results.buffer
  }
}
