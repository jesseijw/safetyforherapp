Pod::Spec.new do |s|
  s.name = 'SafeTripDirections'
  s.version = '0.1.0'
  s.summary = 'Apple walking directions for SafeTrip'
  s.description = 'Exposes MapKit walking routes through Expo Modules.'
  s.author = 'SafeTrip'
  s.homepage = 'https://github.com/jesseijw/safetyforherapp'
  s.license = { :type => 'MIT' }
  s.platform = :ios, '16.4'
  s.source = { :git => 'https://github.com/jesseijw/safetyforherapp.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks = 'MapKit'
  s.source_files = '**/*.{h,m,mm,swift}'
  s.swift_version = '5.9'
end
