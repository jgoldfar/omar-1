Name:          o2
Version:        %{O2_VERSION}
Release:        %{O2_BUILD_RELEASE}%{?dist}
Summary:        New OMAR/O2 Services
Group:          System Environment/Libraries
License:        MIT License
#URL:           http://github
Source0:        http://download.osgeo.org/ossim/source/%{name}-%{version}.tar.gz


%description
O2 Packages

%package 	omar-app
Summary:        OMAR/O2 UI application.
Version:        %{O2_VERSION}
Group:          System Environment/Libraries
Requires:       %{name}%{?_isa} = %{version}-%{release}
Requires: ossim-oms


%package 	wfs-app
Summary:        OMAR/O2 WFS Service
Version:        %{O2_VERSION}
Group:          System Environment/Libraries
Requires:       %{name}%{?_isa} = %{version}-%{release}

%package 	wms-app
Summary:        OMAR/O2 WMS Service
Version:        %{O2_VERSION}
Group:          System Environment/Libraries
Requires:       %{name}%{?_isa} = %{version}-%{release}
Requires: ossim-oms

%package 	stager-app
Summary:        Stager service for the O2 raster database Service
Version:        %{O2_VERSION}
Group:          System Environment/Libraries
Requires:       %{name}%{?_isa} = %{version}-%{release}
Requires: ossim-oms

%package 	superoverlay-app
Summary:        KML Superoverlay service for the O2 raster database Service
Version:        %{O2_VERSION}
Group:          System Environment/Libraries
Requires:       %{name}%{?_isa} = %{version}-%{release}

%package 	hlz-app
Summary:        HLZ Services
Version:        %{O2_VERSION}
Group:          System Environment/Libraries
Requires:       %{name}%{?_isa} = %{version}-%{release}
Requires: ossim-oms

%package 	swipe-app
Summary:        Swipe Services
Version:        %{O2_VERSION}
Group:          System Environment/Libraries
Requires:       %{name}%{?_isa} = %{version}-%{release}

%description  omar-app
OMAR/O2 UI


%description  wms-app
WMS Micro service

%description  wfs-app
WFS Micro Service

%description  stager-app
Stager service for the O2 distribution.  Will support indexing imagery into the shared database

%description  superoverlay-app
Stager service for the O2 distribution.  Will support Google Earth's KML superoverlay

%description  hlz-app
Helicopter landing zone support

%description  swipe-app
Swipe application

%prep
#---
# Notes for debugging:
# -D on setup = Do not delete the directory before unpacking.
# -T on setup = Disable the automatic unpacking of the archives.
#---
#%setup -q -D -T
%setup -q


%build

# Exports:
export OMAR_DEV_HOME=%{_builddir}/%{name}-%{version}
export OSSIM_BUILD_DIR=%{_builddir}/%{name}-%{version}/build
export OSSIM_VERSION=%{RPM_OSSIM_VERSION}
export OSSIM_INSTALL_PREFIX=%{buildroot}/usr
export OMAR_APP_HOME=$OMAR_DEV_HOME/apps/omar-app
export WMS_APP_HOME=$OMAR_DEV_HOME/apps/wms-app
export WFS_APP_HOME=$OMAR_DEV_HOME/apps/wfs-app
export STAGER_APP_HOME=$OMAR_DEV_HOME/apps/stager-app
export SUPEROVERLAY_APP_HOME=$OMAR_DEV_HOME/apps/superoverlay-app
export HLZ_APP_HOME=$OMAR_DEV_HOME/apps/hlz-app
export SWIPE_APP_HOME=$OMAR_DEV_HOME/apps/swipe-app

export OSSIM_INSTALL_PREFIX=%{buildroot}/usr
pushd $OMAR_APP_HOME
./gradlew assemble
popd

pushd $WFS_APP_HOME
./gradlew assemble
popd

pushd $WMS_APP_HOME
./gradlew assemble
popd

pushd $STAGER_APP_HOME
./gradlew assemble
popd

pushd $SUPEROVERLAY_APP_HOME
./gradlew assemble
popd

pushd $HLZ_APP_HOME
./gradlew assemble
popd

pushd $SWIPE_APP_HOME
./gradlew assemble
popd


%install

# Exports:
export OMAR_DEV_HOME=%{_builddir}/%{name}-%{version}
export OSSIM_BUILD_DIR=%{_builddir}/%{name}-%{version}/build
export OSSIM_VERSION=%{RPM_OSSIM_VERSION}
export OSSIM_INSTALL_PREFIX=%{buildroot}/usr
export OMAR_APP_HOME=$OMAR_DEV_HOME/apps/omar-app
export WFS_APP_HOME=$OMAR_DEV_HOME/apps/wfs-app
export WMS_APP_HOME=$OMAR_DEV_HOME/apps/wms-app
export STAGER_APP_HOME=$OMAR_DEV_HOME/apps/stager-app
export SUPEROVERLAY_APP_HOME=$OMAR_DEV_HOME/apps/superoverlay-app
export HLZ_APP_HOME=$OMAR_DEV_HOME/apps/hlz-app
export SWIPE_APP_HOME=$OMAR_DEV_HOME/apps/swipe-app

pushd $OMAR_APP_HOME
install -d %{buildroot}/opt/ossimlabs/omar-app
install -p -m644 build/libs/omar-app*.jar %{buildroot}/opt/ossimlabs/o2-omar-app
popd

pushd $WFS_APP_HOME
install -d %{buildroot}/opt/ossimlabs/wfs-app
install -p -m644 build/libs/wfs-app*.jar %{buildroot}/opt/ossimlabs/o2-wfs-app
popd

pushd $WMS_APP_HOME
install -d %{buildroot}/opt/ossimlabs/wms-app
install -p -m644 build/libs/wms-app*.jar %{buildroot}/opt/ossimlabs/o2-wms-app
popd

pushd $STAGER_APP_HOME
install -d %{buildroot}/opt/ossimlabs/stager-app
install -p -m644 build/libs/stager-app*.jar %{buildroot}/opt/ossimlabs/o2-stager-app
popd

pushd $SUPEROVERLAY_APP_HOME
install -d %{buildroot}/opt/ossimlabs/superoverlay-app
install -p -m644 build/libs/superoverlay*.jar %{buildroot}/opt/ossimlabs/o2-superoverlay-app
popd

pushd $HLZ_APP_HOME
install -d %{buildroot}/opt/ossimlabs/hlz-app
install -p -m644 build/libs/hlz*.jar %{buildroot}/opt/ossimlabs/o2-hlz-app
popd

pushd $SWIPE_APP_HOME
install -d %{buildroot}/opt/ossimlabs/swipe-app
install -p -m644 build/libs/swipe*.jar %{buildroot}/opt/ossimlabs/o2-swipe-app
popd


%post

%files omar-app
/opt/ossimlabs/o2-omar-app

%files wfs-app
/opt/ossimlabs/o2-wfs-app

%files wms-app
/opt/ossimlabs/o2-wms-app

%files stager-app
/opt/ossimlabs/o2-stager-app

%files superoverlay-app
/opt/ossimlabs/o2-superoverlay-app

%files hlz-app
/opt/ossimlabs/o2-hlz-app

%files swipe-app
/opt/ossimlabs/o2-swipe-app
