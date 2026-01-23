
function cleanValue(val) {
    // Check if value is a 34-char hex string starting with 3D
    // This is a specific fix for Issue #8 where users paste values with encoded prefixes
    if (typeof val === 'string' && val.match(/^3D[0-9a-fA-F]{32}$/)) {
        return val.substring(2);
    }
    return val;
}

function generateLink(baseUrl, tableName, fields) {
    const queryParts = [];
    fields.forEach(f => {
      let val = f.value;
      // Apply cleaning
      val = cleanValue(val);
      
      if (val) {
        queryParts.push(`${f.name}=${val}`);
      }
    });

    const queryString = queryParts.join('^');
    let url = `${baseUrl}/${tableName}.do?sys_id=-1`;
    
    // Standard Encoding (reverting v0.4.6 manual encoding)
    if (queryString) {
      url += `&sysparm_query=${encodeURIComponent(queryString)}`;
    }
    
    return url;
}

const baseUrl = "https://zilverton.service-now.com";
const tableName = "change_request";
const fields = [
    { name: "cmdb_ci", value: "c868532f3b2ae290eefc517f16e45ae0" },
    { name: "category", value: "Software" },
    { name: "short_description", value: "Enrollment - AWS - REL" },
    { name: "description", value: "This is a test" },
    { name: "u_environment", value: "release_nonprod" },
    { name: "assignment_group", value: "3Da12cf5dd2bbf9e50e2b4f21a6e91bfd4" }
];

const generatedUrl = generateLink(baseUrl, tableName, fields);
const expectedUrl = "https://zilverton.service-now.com/change_request.do?sys_id=-1&sysparm_query=cmdb_ci%3Dc868532f3b2ae290eefc517f16e45ae0%5Ecategory%3DSoftware%5Eshort_description%3DEnrollment%20-%20AWS%20-%20REL%5Edescription%3DThis%20is%20a%20test%5Eu_environment%3Drelease_nonprod%5Eassignment_group%3Da12cf5dd2bbf9e50e2b4f21a6e91bfd4";

console.log("Generated:", generatedUrl);
console.log("Expected: ", expectedUrl);

if (generatedUrl === expectedUrl) {
    console.log("SUCCESS: URL matches expected output");
} else {
    console.log("FAIL: URL does not match");
}
