FROM radiantbluetechnologies/o2-base
RUN yum -y install o2-wmts-app && yum clean all
ADD wmts-app.yml /usr/share/omar/wmts-app/wmts-app.yml
ENV DBUSER=${DBUSER}\
    DBPASS=${DBPASS}\
    DBHOST=${DBHOST}\
    DBPORT=${DBPORT}\
    DBNAME=${DBNAME}\
    WFSSERVER=${WFSSERVER}\
    WFSPORT=${WFSPORT}\
    WMSSERVER=${WMSSERVER}\
    WMSPORT=${WMSPORT}

EXPOSE 8080
CMD ["sh", "/usr/share/omar/wmts-app/wmts-app.sh"]

