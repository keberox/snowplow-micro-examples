
function matchEventContext(eventContexts, microContexts) {
    // if contexts is empty list
    matched = true;
    for (i = 0; i < eventContexts.length; i++) {
        eventContext = eventContext[i];
        matched = false;
        for (j = 0; j < microContexts.length; j++) {
            microContext = microContexts[j];
            if (eventContext["schema"] != microContext["schema"]) {
                continue;
            }
            if (eventContext.hasOwnProperty("data")) {
                for (let dt_key in eventContext["data"]) {
                    if (microContext["data"].hasOwnProperty(dt_key) && eventContext["data"][dt_key] === microContext["data"][dt_key]) {
                        // we found a match for the event context so we break and look for a match for the next event context
                        matched = true;
                        break;
                    }

                }
            }

        }
        // one of the event context is not matched so we break the for loop and return false
        if (!matched) {
            break;
        }

    }

    return matched;

};

function matchEventsBySchema(event, microEvent) {
    if (event["eventType"] == "ue" && microEvent["eventType"] == "ue") {

        ue_event = JSON.parse(microEvent["event"]["parameters"]["ue_pr"]);

        return event["schema"] === ue_event["data"]["schema"];
    } else if (event["eventType"] == "se" && microEvent["eventType"] == "se") {

    } else {
        // one of them is not ue
        return false;
    }


}

function matchEventsByParams(event, microEvent) {
    matched = true;

    if (event["eventType"] == "ue" && microEvent["eventType"] == "ue") {
        ue_event = JSON.parse(microEvent["event"]["parameters"]["ue_pr"]);

        // unstructured events
        for (var param_key in event["parameters"]) {
            if (!(ue_event["data"]["data"].hasOwnProperty(param_key) &&
                    ue_event["data"]["data"][param_key] == event["parameters"][param_key])) {
                matched = false;
                break;
            }
        }

    } else if (event["eventType"] == "se" && microEvent["eventType"] == "se") {
        // structured events
        for (var param_key in event["parameters"]) {
            if (!(microEvent["event"]["parameters"].hasOwnProperty(param_key) && microEvent["event"]["parameters"][param_key] == event["parameters"][param_key])) {
                matched = false;
                break;
            }
        }
    } else {
        // one of them is not ue
        return false;
    }

    return matched;
};


function matchEvents(expected_event, eventM) {
    // match the context of each event M with our expected event context
    matched = true;
    if (eventM["event"]["parameters"].hasOwnProperty("co") && eventM["event"]["parameters"]["co"].hasOwnProperty("data") &&
        expected_event.hasOwnProperty("contexts")) {
        matched &= matchEventContext(expected_event["contexts"], eventM["event"]["parameters"]["co"])["data"];
    }

    return matched && matchEventsBySchema(expected_event, eventM) &&
        matchEventsByParams(expected_event, eventM);
};