# Welcome to OMAR suite of Web Services

## Binary Distribution and Setup

For a quick example on how to configure and setup the new OMAR web services please visit the repo found here [https://github.com/ossimlabs/ossim-vagrant](https://github.com/ossimlabs/ossim-vagrant). The vagrant setup uses salt to provision each web service and is a good example on how to setup a default configuration on a CentOS distribution.  


In this document we will address the following:

* Common settings and configuration.
* Common User and Group
* Settings and configuration for each web service.
* Service Templates init.d
* Service Template systemd 

 


## Common Settings and Configuration

The current binary delivery for all the OMAR web applications is via a yum repository.  Create a repo file in your /etc/yum.repos.d/ossim.repo directory location.  Set the contents of the repo to the following:

```bash
sudo vi /etc/yum.repos.d/ossim.repo
```

**Create Yum Repo**

```yum
[ossim]
name=CentOS-$releasever - ossim packages for $basearch
baseurl=http://s3.amazonaws.com/o2-rpms/CentOS/$releasever/dev/$basearch
enabled=1
gpgcheck=0
metadata_expire=5m
protect=1
```

Note, in the above **baseurl** variable we have different branches that you can hook into.  In the path you will see a **dev** path http://s3.amazonaws.com/o2-rpms/CentOS/$releasever/**dev**/$basearch.  We also have the **master** branch that is being built and packaged and you can modify this url to use **master**:  http://s3.amazonaws.com/o2-rpms/CentOS/$releasever/**master**/$basearch.  In the future we will have versioned branches that can be setup and installed.  The dev branch could change hourly and so the yum repo for the dev branch might be in the middle of an update when you are accessing the packages.  The master branch will update much less frequently and will only change when a pull request is performed on the dev branch to merge the changes into master.

###Setup EPEL

The [Epel](https://fedoraproject.org/wiki/EPEL) site has links to the EL6, EL7, and EL5 RPM repo installations via RPMs.   We have tested the [EL6 RPM](https://dl.fedoraproject.org/pub/epel/epel-release-latest-6.noarch.rpm) with the CentOS 6 distribution and [EL7 RPM](https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm) with the CentOS 7 distribution.

If you need to install epel manually you can install the RPM by using yum command for EL6:

```bash
yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-6.noarch.rpm
```

and for EL7:

```bash
yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```

###Firewall Settings Using iptables

By default the web applicaiton will come up and listen on port 8080.  Typically we will add the port to the iptables setting to open TCP on port 8080:

```bash
sudo vi /etc/sysconfig/iptables

add the line:

-A INPUT -p tcp -m state --state NEW -m tcp --dport 8080 -j ACCEPT
sudo service iptables restart
```
Your resulting iptables should look something similar to but not necessarily exact to the following:

```bash

# Generated by iptables-save v1.4.7 on Fri May  6 13:32:29 2016
*filter
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [9:608]
-A INPUT -p tcp -m state --state NEW -m tcp --dport 8080 -j ACCEPT
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
-A INPUT -p icmp -j ACCEPT
-A INPUT -i lo -j ACCEPT
-A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT
-A INPUT -j REJECT --reject-with icmp-host-prohibited
-A FORWARD -j REJECT --reject-with icmp-host-prohibited
COMMIT
# Completed on Fri May  6 13:32:29 2016
```

### Firewall Settings using firewalld

On CentOS7 they use the firewalld.   To list your zones you can issue the following command:

```bash
firewall-cmd --get-active-zones

Output:

public
  interfaces: eth0
```

Now to add port 8080 to the public interface you can execute the following command line application:

```bash
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
```

Restart the service:

```bash
sudo systemctl restart firewalld
```

### SELINUX Configuration

If SELINUX is running you must enable the boolean flag

**httpd\_can\_network_connect**

To list all booleans for httpd and see if your network connect is turned on you can perform the **getsebool** and get output similar to the following:

```bash
/usr/sbin/getsebool -a | grep httpd

Output:

httpd_anon_write --> off
httpd_builtin_scripting --> on
httpd_can_check_spam --> off
httpd_can_connect_ftp --> off
httpd_can_connect_ldap --> off
httpd_can_connect_mythtv --> off
httpd_can_connect_zabbix --> off
httpd_can_network_connect --> on
httpd_can_network_connect_cobbler --> off
httpd_can_network_connect_db --> off
httpd_can_network_memcache --> off
httpd_can_network_relay --> off
httpd_can_sendmail --> off
httpd_dbus_avahi --> off
httpd_dbus_sssd --> off
httpd_dontaudit_search_dirs --> off
httpd_enable_cgi --> on
httpd_enable_ftp_server --> off
httpd_enable_homedirs --> off
:
:
:
:
:
```
To set a boolean you can give the setsebool command:

```bash
sudo setsebool -P httpd_can_network_connect on
```

### Common User and Group

We will use our common user name "omar" and create a group with the same name.  We will not create the home account and make this a system user.

```
adduser -r -d /usr/share/omar --no-create-home --user-group omar
```

This account will be used for running a service with a common "omar" user name and group.

### Service Templates For init.d

Installing from RPM you should not have to add this file but we will specify it here for clarity.  For systems using the startup for init.d we add a file called /etc/init.d/\<program_name>.  The template contents should look similar to the following:

```
#!/bin/bash
#
### BEGIN INIT INFO
# chkconfig: 3 80 20
# Provides: General service wrapper for {{program_name}} services
# Required-Start: $network $syslog
# Required-Stop: $network $syslog
# Default-Start: 3
# Default-Stop: 0 1 2 6
# Should-Start: $network $syslog
# Should-Stop: $network $syslog
# Description: start, stop and restart script
# Short-Description: start, stop and restart ingestListener
### END INIT INFO
RETVAL=$?
PROG={{program_name}}
PROG_USER={{program_user}}
PROG_GROUP={{program_group}}
PID_DIR="/var/run/${PROG}"
PROG_PID_DIR="${PID_DIR}"
PROG_PID="$PID_DIR/${PROG}.pid"
PROG_LOG_DIR="/var/log/${PROG}"
PROG_ERROR_LOG="${PROG_LOG_DIR}/error_log"
export WORKING_DIR="/usr/share/omar/${PROG}"
RUN_PROG_TEST="/usr/share/omar/${PROG}/${PROG}.sh"
RUN_PROGRAM="${RUN_PROG_TEST} ${PROG_PID}"

# Must be exported in order for catatlina to generate pid file
export PROG_PID
start() {
   if [ -f "$RUN_PROG_TEST" ]; then
      # Make omar lock file dir and change ownership to omar user
      if [ ! -d "$PID_DIR" ]; then
            mkdir -p $PID_DIR
            chown $PROG_USER:$PROG_GROUP $PID_DIR
      fi
      # Make omar log directory and change ownership to omar user
      if [ ! -d "$PROG_LOG_DIR" ]; then
            mkdir -p $PROG_LOG_DIR
            chown $PROG_USER:$PROG_GROUP $PROG_LOG_DIR
      fi
      # Check for running instance
      if [ -e "$PROG_PID" ]; then
              read PID < $PROG_PID
                   if checkpid $PID 2>&1; then
                       echo $"$PROG process is already running..."
                           return 1
                           echo_failure
                       else
                           echo "Lock file found but no $PROG process running for (pid $PID)"
                           echo "Removing old lock file..."
                     rm -rf $PROG_PID
                   fi
        fi
         echo -ne $"Starting $PROG: "
         echo $RUN_PROGRAM
            /bin/su - $PROG_USER $RUN_PROGRAM >> $PROG_ERROR_LOG 2>&1
            RETVAL="$?"
          if [ "$RETVAL" -eq 0 ]; then
               echo_success
                  echo -en "\n"
            else
                  echo_failure
                  echo -en "\n"
               exit 1
          fi
   else
      echo "$RUN_PROGRAM does not exist..."
      echo_failure
      echo -en "\n"
      exit 1
   fi
}

stop() {
    COUNT=0
    WAIT=10
    if [ -e "$PROG_PID" ]; then
      read PID < $PROG_PID
#echo ${PID}
        if checkpid $PID 2>&1; then
            echo -ne $"Stopping $PROG: "
         kill $PID >> $PROG_ERROR_LOG 2>&1
         RETVAL="$?"
         sleep 2
            while [ "$(ps -p $PID | grep -c $PID)" -eq "1"  -a  "$COUNT" -lt "$WAIT" ]; do
            echo -ne "\nWaiting on $PROG process to exit..."
            COUNT=`expr $COUNT + 1`
            sleep .3
            done

               if [ "$(ps -p $PID | grep -c $PID)" == "1" ] ; then
                  echo -ne "\nCouldn't shutdown, forcing shutdown of $PROG process"
                  kill -9 $PID
               fi
               echo_success
               echo -en "\n"
      fi
   else
      echo -ne $"Stopping $PROG: "
      echo_failure
      echo -en "\n"
   fi
}

status() {
  RETVAL="1"
    if [ -e "$PROG_PID" ]; then
        read PID < $PROG_PID
        if checkpid $PID 2>&1; then
            echo "$PROG (pid $PID) is running..."
            RETVAL="0"
        else
            echo "Lock file found but no process running for (pid $PID)"
        fi
    else
        PID="$(pgrep -u $PROG_USER java)"
        if [ -n "$PID" ]; then
            echo "$PROG running (pid $PID) but no PID file exists"
            RETVAL="0"
        else
            echo "$PROG is stopped"
            RETVAL="1"
        fi
    fi
    return $RETVAL
}

# Check if pid is running
checkpid() {
   local PID
   for PID in $* ; do
      [ -d "/proc/$PID" ] && return 0
   done
   return 1
}

echo_success() {
   if [ -e "/etc/redhat-release" ]; then
      echo -en "\\033[60G"
      echo -n "[  "
      echo -en "\\033[0;32m"
      echo -n $"OK"
      echo -en "\\033[0;39m"
      echo -n "  ]"
      echo -en "\r"
   elif [ -e "/etc/SuSE-release" ]; then
      echo -en "\\033[60G"
      echo -en "\\033[1;32m"
      echo -n $"done"
      echo -en "\\033[0;39m"
      echo -en "\r"
   else
      echo -en "\\033[60G"
      echo "OK"
      echo -en "\r"
   fi
   return 0
}

echo_failure() {
   if [ -e "/etc/redhat-release" ]; then
      echo -en "\\033[60G"
      echo -n "["
      echo -en "\\033[0;31m"
      echo -n $"FAILED"
      echo -en "\\033[0;39m"
      echo -n "]"
      echo -en "\r"
   elif [ -e "/etc/SuSE-release" ]; then
      echo -en "\\033[60G"
      echo -en "\\033[0;31m"
      echo -n $"failed"
      echo -en "\\033[0;39m"
      echo -en "\r"
   else
      echo -en "\\033[60G"
      echo "FAILED"
      echo -en "\r"
   fi
    return 1
}

# See how we were called.
case "$1" in
 start)
   start
   ;;
 stop)
   stop
   ;;
restart)
   stop
    sleep 2
    start
    ;;
status)
   status
   ;;
 *)
   echo $"Usage: $PROG {start|stop|restart|status}"
   exit 1
   ;;
esac

exit $RETVAL
``` 
* **{{program_name}}** is replaced by the web service name:  For example wmts-app.
* **{{program_user}}** is replaced by the user.  In this case the username is *omar*.
* **{{program_group}}** is replaced by the group name.  In this case we use the group name *omar*.

If you were creating a startup script for wmts-app then all occurances of the pattern {{program_name}} would be replaced with wmts-app.


### Service Templates For Systemd

Using the CentOS 7 RPM repo for the OMAR distribution it will automatically install the systemd startup scripts in the location /usr/lib/systemd/system/<app-name>.service.   The contents of each systemd service file will look something like the following:

```bash
[Service]
PermissionsStartOnly=true
Type=forking
PIDFile=/var/run/{{program_name}}/{{program_name}}.pid
ExecStart=/bin/bash -c "/usr/share/omar/{{program_name}}/{{program_name}}.sh /var/run/{{program_name}}/{{program_name}}.pid >> /var/log/{{program_name}}/{{program_name}}.log 2>&1" &
User={{program_user}}
Group={{program_group}}
WorkingDirectory=/usr/share/omar/{{program_name}}
Restart=on-abort
```
* **{{program_name}}** is replaced by the web service name:  For example wmts-app.
* **{{program_user}}** is replaced by the user.  In this case the username is *omar*.
* **{{program_group}}** is replaced by the group name.  In this case we use the group name *omar*.

All web application are installed under the /usr/share/omar/\<program_name> directory.

### Common Server Port and Context

All services will have a common configuration entry in their yaml file that contains an entry of the form:

```
server:
  contextPath:
  port: 8080
```

* **contextPath** You can specify the context path and this is added to the URL to the server.  If the context is say "O2" then to access the url root path you will need to proxy to the location \<ip>:\<port>/O2
* **port**  Defines the port that this servcie will listen on.  Default is port 8080

### Common Database

We typically use a common database server to store any service specific table data.  Within this installation we have tested against a Postgres database server.  All services will have a common configuration entry in their yaml file that contains an entry of the form:

```
environments:
  production:
    dataSource:
      pooled: true
      jmxExport: true
      driverClassName: org.postgresql.Driver
      username: postgres
      password:
      dialect: 'org.hibernate.spatial.dialect.postgis.PostgisDialect'
      url: jdbc:postgresql://<ip>:<port>/omardb-prod

```

* **dataSource.url** In each of the individual service documentation they will describe further where their configuration yaml file is located. The above **dataSource** defines Postgres as our connecting source and we assume a postgres instance is setup for us to connect to.  In the connection you will need to specify the **url** to connect to. The **ip** and **port** will need to be replaced with your database server instance. Postgres typically defaults to **port** 5432.
* **dataSource.username** username for the database.
* **dataSource.password** password for the database.

## Web Service Configuration

We have seen the common settings found on all of the Web Application Services.  In this section please follow the specific configuration for each web application.  The documentation will assume that the common settings have been applied and will not be repeated.  We will show all files/directories required to run the web service.

* [WMTS Installation and setup](apps/wmts-app/README.md)
* [WMS Installation and setup](apps/wms-app/README.md)
* [WFS Installation and setup](apps/wfs-app/README.md)
* [Stager Installation and setup](apps/stager-app/README.md)
