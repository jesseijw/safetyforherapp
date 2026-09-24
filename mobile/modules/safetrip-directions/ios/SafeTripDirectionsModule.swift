import ExpoModulesCore
import MapKit

public class SafeTripDirectionsModule: Module {
  private var requests: [String: MKDirections] = [:]

  public func definition() -> ModuleDefinition {
    Name("SafeTripDirections")

    AsyncFunction("calculate") { (requestID: String, originLat: Double, originLng: Double, destinationLat: Double, destinationLng: Double, promise: Promise) in
      let origin = CLLocationCoordinate2D(latitude: originLat, longitude: originLng)
      let destination = CLLocationCoordinate2D(latitude: destinationLat, longitude: destinationLng)
      guard CLLocationCoordinate2DIsValid(origin), CLLocationCoordinate2DIsValid(destination) else {
        promise.reject("INVALID_COORDINATES", "Select valid map coordinates.")
        return
      }
      let request = MKDirections.Request()
      request.source = MKMapItem(placemark: MKPlacemark(coordinate: origin))
      request.destination = MKMapItem(placemark: MKPlacemark(coordinate: destination))
      request.transportType = .walking
      request.requestsAlternateRoutes = true
      let directions = MKDirections(request: request)
      self.requests[requestID] = directions
      directions.calculate { response, error in
        self.requests.removeValue(forKey: requestID)
        if let error = error {
          promise.reject("DIRECTIONS_FAILED", error.localizedDescription)
          return
        }
        guard let routes = response?.routes, !routes.isEmpty else {
          promise.reject("NO_ROUTES", "Apple Maps did not return a walking route.")
          return
        }
        let result: [[String: Any]] = routes.enumerated().map { index, route in
          let points = route.polyline.points()
          let coordinates: [[String: Double]] = (0..<route.polyline.pointCount).map { i in
            let c = points[i].coordinate
            return ["latitude": c.latitude, "longitude": c.longitude]
          }
          return ["id": "apple-\(index)", "name": route.name, "distance": route.distance,
                  "duration": route.expectedTravelTime, "source": "apple", "coordinates": coordinates,
                  "steps": route.steps.filter { !$0.instructions.isEmpty }.map { ["instruction": $0.instructions, "distance": $0.distance] as [String: Any] }]
        }
        promise.resolve(result)
      }
    }.runOnQueue(.main)

    AsyncFunction("cancel") { (requestID: String) in
      self.requests.removeValue(forKey: requestID)?.cancel()
    }.runOnQueue(.main)
  }
}
