# Welcome to the SQS Service

The SQS service allows one to Read from an Amazon **S**imple **Q**ueueing **S**ystem (**SQS**) and redirect the messages either to standard out or to another URL endpoint by issuing a post.  We use a background job to poll the SQS for any pending messages and will only delete the messages from the SQS if the message was handled properly.  If the message was not handled properly it will remain on the queue and be reset automatically based on the queue properties.

##Installation

We assume you have configured the yum repository described in [OMAR Common Install Guide](common.md).  To install you should be able to issue the following yum command

```yum
yum install o2-sqs-app
```

The installation sets up

* Startup scripts that include /etc/init.d/sqs-app for init.d support and /usr/lib/systemd/system/sqs-app.service for systems running systemd
* Creates a system user called *omar*
* Creates log directory with user *omar* permissions under /var/log/sqs-app
* Creates a var run directory with user *omar* permissions under /var/run/sqs-app
* Adds the fat jar and shell scripts under the directory /usr/share/omar/sqs-app location


##Configuration

The configuration file is a yaml formatted config file.   For now create a file called swipe-app.yaml.  At the time of writting this document we do not create this config file for this is usually site specific configuration and is up to the installer to setup the document.

```bash
sudo vi /usr/share/omar/sqs-app/sqs-app.yml
```

that contains the following settings:

```
server:
  contextPath:
  port: 8080

omar:
  sqs:
    reader:
      queue: "https://<AmazonDNS>/<path_to_queue>"
      waitTimeSeconds: 20
      maxNumberOfMessages: 1
      pollingIntervalSeconds: 10
      destination:
        type: "post"
        post:
            urlEndPoint: ""
            field: message
---
grails:
  serverURL: http://<ip>:<port>/
  assets:
    url: http://<ip>:<port>/assets/
```

* **queue** defines an Amazon SQS endpoint for access.
* **waitTimeSecond** This value can be between 1 and 20 and can not exceed 20 or you get errors and the service will not start proeprly.  This value is used by the AWS API to wait for a maximum time for a message to occur before returning.
* **maxNumberOfMessages** Value can only be between 1 and 10.  Any other value will give errors and the service will not start properly.  This defines the maximum number of messages to pop off the queue during a single read request to the service.
* **pollingIntervalSeconds** this can be any value and defines the number of second to *SLEEP* the background process between each call to the read request.  By default it will keep calling the read request until no messages are found.  After no messages are found the backgroun process will then *SLEEP* for **pollingIntervalSeconds**.
* **destination.type** This value can be either "post" or "stdout".   If the value is a post then it expects the **post** entry to be defined.  If the type is stdout then all message payload/message body are printed to standard out.
* **destination.post.urlEndPoint** Defines the url to post the message to
* **destination.post.field** Defines the post field to put the message payload.

## AWS Credentials

Currently we assume that the credentials are put in the proper location.  For testing we added a file to the home account of the user the sqs-app process is running as.  

```
vi ~/.aws/credentials
```

with contents

```
[default]
aws_access_key_id=
aws_secret_access_key=
```

Where you replace **aws\_access\_key\_id** and **aws\_secret\_access\_key** with your AWS credentials.

