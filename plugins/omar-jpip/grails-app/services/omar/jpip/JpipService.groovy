package omar.jpip

import grails.core.GrailsApplication
import grails.transaction.Transactional
// import groovyx.net.http.HTTPBuilder

import groovy.util.logging.Slf4j
import omar.oms.ChipperUtil
import org.apache.tomcat.util.net.URL

// import omar.jpip.Util

@Transactional
class JpipService
{
   // Initialized by grails:
   GrailsApplication grailsApplication

    synchronized def nextJob()
    {
        def firstObject = JpipJob.first()
        def result = firstObject?.properties as HashMap
        result = result?:[:]
        firstObject?.delete()
        result
    }

    def createStream(ConvertCommand cmd)
    {
       log.trace("JpipService::createStream entered...")

       HashMap result = null

       def row = JpipImage.findByFilenameAndEntryAndProjCode(cmd.filename, cmd.entry, cmd.projCode)
       if(!row)
       {
          convert( cmd )

          // Get the row again:
          row = JpipImage.findByFilenameAndEntryAndProjCode(cmd.filename, cmd.entry, cmd.projCode)
       }

       result = getJpipLink( row )

       log.info("result: ${result}")
       log.trace("JpipService::createStream exited...")

       result
    }

    def removeStream(ConvertCommand cmd)
    {
       log.trace("JpipService::removeStream entered...")

       def row = JpipImage.findByFilenameAndEntryAndProjCode(cmd.filename, cmd.entry, cmd.projCode)
       if(!row)
       {
          // TODO:
       }

       result = getJpipLink( row )

       log.info("result: ${result}")
       log.trace("JpipService::removeStream exited...")

       result
    }

    def convert(ConvertCommand cmd)
    {
       log.trace("JpipService::convert entered...")
       log.info("cmd: ${cmd}")

       def row = JpipImage.findByFilenameAndEntryAndProjCode(cmd.filename, cmd.entry, cmd.projCode)
       if(!row)
       {
          String uuidString = "${UUID.randomUUID().toString()}-${cmd.projCode}"
          
          JpipImage image = new JpipImage(
                filename:cmd.filename,
                entry:cmd.entry,
                projCode:cmd.projCode,
                jpipId:uuidString,
                status:JobStatus.READY.toString())
          if( !image.save(flush:true) )
          {
             trace.error("JpipImage.save failed!")
          }

          JpipJob job = new JpipJob(
                jpipId: image.jpipId,
                filename:cmd.filename,
                entry:cmd.entry,
                projCode:cmd.projCode)
          //image.jpipId

          if( !job.save(flush:true) )
          {
             trace.error("JpipJob.save failed!")
          }
       }

       log.trace("JpipService::convert exited...")
    }

    def updateStatus(String jpipId, String status)
    {
        JpipImage row = JpipImage.findByJpipId(jpipId)
	
        if ( row )
        {
            if(row.status != status)
            {
                row.status = status
                row.save(flush:true)
            }
        }

        row = null
    }

    def convertImage(HashMap jpipJobMap)
    {
        log.trace( "convertImage: entered...")

        if(jpipJobMap)
        {
            String jpipCacheDir = getCacheDir()
            String inFile = "${jpipJobMap?.filename}".toString()
            String entry = "${jpipJobMap?.entry}".toString()
            String outFile = "${jpipCacheDir}/${jpipJobMap?.jpipId}.jp2".toString()

            log.info( "input_file: ${inFile}")
            log.info( "output_file: ${outFile}")

	    // TODO: Make 'operation' ortho or chip from flag.

            def jpipId = jpipJobMap.jpipId
            HashMap initOps
            if ( jpipJobMap.projCode.toLowerCase() == "chip" )
            {
                initOps = [
                    hist_op:  "auto-minmax",
                    "image0.file": inFile,
                    "image0.entry": outFile,
                    operation: "chip",
                    output_file: outFile,
                    output_radiometry: "U8",
                    three_band_out: "true",
                    writer: "ossim_kakadu_jp2",
                    writer_property0:"compression_quality=epje"]
             }
             else if ( jpipJobMap.projCode.toLowerCase() == "geo-scaled" )
             {
                initOps = [
                    hist_op:  "auto-minmax",
                    "image0.file": inFile,
                    "image0.entry": outFile,
                    operation: "ortho",
                    output_file: outFile,
                    output_radiometry: "U8",
                    projection: "geo-scaled",
                    three_band_out: "true",
                    writer:  "ossim_kakadu_jp2",
                    writer_property0:"compression_quality=epje"]
            }
            else
            {
                initOps = [
                    hist_op:  "auto-minmax",
                    "image0.file": inFile,
                    "image0.entry": outFile,
                    operation: "ortho",
                    output_file: outFile,
                    output_radiometry: "U8",
                    srs: "EPSG:${jpipJobMap?.projCode}".toString(),
                    three_band_out: "true",
                    writer: "ossim_kakadu_jp2",
                    writer_property0:"compression_quality=epje"]
            }

            log.debug("ChipperUtil options: ${initOps}")

            updateStatus(jpipId, JobStatus.RUNNING.toString())
            if(ChipperUtil.executeChipper(initOps))
            {
                updateStatus(jpipId, JobStatus.FINISHED.toString())
            }
            else
            {
                updateStatus(jpipId, JobStatus.FAILED.toString())
            }
        }

        log.trace("convertImage: exited...")
    }

   String getCacheDir()
   {
      String result = new String()
      result = OmarJpipReflectionUtils.jpipConfig.server.cache //grailsApplication.config.getProperty('jpip.server.cache', "/tmp")
      return result
   }

   String getServerUrl()
   {
      String result = new String()
      result = OmarJpipReflectionUtils.jpipConfig.server.url //grailsApplication.config.getProperty('jpip.server.url')?:null
      return result
   }

   HashMap getJpipLink( JpipImage row )
   {
      HashMap result = [:]
      if ( row != null )
      {
         String urlString = getServerUrl()
         urlString += "/" + row.jpipId + ".jp2"
         result.url = urlString
         result.status = row.status
     }
      result
   }
}
