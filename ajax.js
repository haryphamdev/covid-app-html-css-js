let dataSummary = [];

function loadDataCovid() {
    let url = "https://api.covid19api.com/summary";
    $.ajax({
        url: url,
        method: "GET",
        success: function(data) {
            if (data.Global) {
                let totalConfirmed = data.Global.TotalConfirmed;
                let totalDeaths = data.Global.TotalDeaths;
                let totalRecovered = data.Global.TotalRecovered;
                let totalStillActive = totalConfirmed - totalDeaths - totalRecovered;

                // update div elements
                $("#covidSum").text(totalConfirmed.toLocaleString());
                $("#covidDeath").text(totalDeaths.toLocaleString());
                $("#covidRecover").text(totalRecovered.toLocaleString());
                $("#covidStill").text(totalStillActive.toLocaleString());

                if (data.Countries) {
                    let countries = data.Countries;
                    //set value for dataSummary
                    dataSummary = countries;

                    countries.sort((a, b) => {
                        return a.TotalConfirmed - b.TotalConfirmed;
                    });

                    let topSmallest = countries.slice(0, 10);
                    let topBiggest = countries.slice(countries.length - 10, countries.length);
                    console.log(countries.slice(0, 10));
                    console.log(countries.slice(countries.length - 10, countries.length));

                    // generate tables
                    generateLeftTable(topBiggest);
                    generateRightTable(topSmallest);
                }
            }

        },
        error: function(error) {
            console.log(error)
        }
    });
}

//top biggest
function generateLeftTable(data) {
    let html = "";
    data.reverse().forEach((country, index) => {
        html += `
        <tr> 
            <td>${index + 1}</td>
            <td class="display-name-country">${country.Country}</td>
            <td>${country.TotalConfirmed.toLocaleString()}</td>
            <td>${country.TotalDeaths.toLocaleString()}</td>
            <td>${country.TotalRecovered.toLocaleString()}</td>
        </tr>
        `;
    });

    $("#tableBiggest tbody").append(html);
}

//top smallest
function generateRightTable(data) {
    let html = "";
    data.forEach((country, index) => {
        html += `
        <tr> 
            <td>${index + 1}</td>
            <td class="display-name-country">${country.Country}</td>
            <td>${country.TotalConfirmed.toLocaleString()}</td>
            <td>${country.TotalDeaths.toLocaleString()}</td>
            <td>${country.TotalRecovered.toLocaleString()}</td>
        </tr>
        `;
    });

    $("#tableSmallest tbody").append(html);
}

function handleBtnSearch() {
    $("#btnSearch").on("click", function(event) {
        let term = $("#inputSearch").val();
        let country = findCountryByISOCode(dataSummary, term);
        if (country.length > 0) {
            let slug = country[0].Slug;
            //call api to get data
            $.ajax({
                url: `https://api.covid19api.com/total/country/${slug}`,
                method: "GET",
                success: function(data) {
                    //empty the div result
                    $("#generateResult").empty();
                    $("#infoResult").text("");
                    let threeDaysResult = data.slice(data.length - 3, data.length);

                    let html = "";
                    threeDaysResult.forEach(item => {
                        let date = moment(item.Date).format("MM-DD-YYYY");
                        html += `
                      <div class="item-result">
                            <div class="date">${date}</div>
                            <ul>
                                <li>Total summary: ${item.Confirmed.toLocaleString()}</li>
                                <li>Total deaths: ${item.Deaths.toLocaleString()}</li>
                                <li>Total recovered: ${item.Recovered.toLocaleString()}</li>
                                <li>Total still active: ${item.Active.toLocaleString()}</li>
                            </ul>
                    </div>
                      `;
                    });
                    $("#infoResult").text(`We found your country --- ${country[0].Country} ---`);
                    $("#generateResult").append(html);

                },
                error: function(error) {
                    console.log(error);
                }
            })
        } else {
            // 404 not found
            alert("404 not found. Please try with another country code!")
        }
    });
}

function findCountryByISOCode(arrayCountry, term) {
    return arrayCountry.filter(
        (item) => item.CountryCode.toLowerCase().indexOf(term.toLowerCase()) > -1
    );
}

$(document).ready(function(e) {
    loadDataCovid();
    handleBtnSearch();
});