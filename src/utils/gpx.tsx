import polyline from "@mapbox/polyline";


export const getGPXFile = (polylineInput: string, activityName: string) => {
    const points = polyline.decode(polylineInput);
    const gpxContent = polylineToGPX(points, activityName);
    return new File(
        [gpxContent],
        `${activityName.replace(/\s+/g, '_') || 'activity'}.gpx`,
        { type: "application/gpx+xml" }
    );
};

function polylineToGPX(points: [number, number][], name: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="YourAppName" xmlns="http://www.topografix.com/GPX/1/1">\n  <trk>\n    <name>${name}</name>\n    <trkseg>\n      ${points.map(([lat, lon]) => `<trkpt lat="${lat}" lon="${lon}"></trkpt>`).join('\n      ')}\n    </trkseg>\n  </trk>\n</gpx>`;
}