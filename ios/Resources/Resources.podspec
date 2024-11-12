Pod::Spec.new do |s|
  s.name             = 'Resources'
  s.version          = '0.0.1-dev'
  s.author           = { 'Oskar Kwaśniewski' => 'oskarkwasniewski@icloud.com' }
  s.license          = 'MIT'
  s.homepage         = 'https://callstack.com'
  s.source           = { :git => 'https://callstack.com' }
  s.summary          = 'Resources for AwesomeApp'
  s.resources = '*.{drc,exr,basis}'
end
