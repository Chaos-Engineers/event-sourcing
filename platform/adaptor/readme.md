# 🔱Adaptor
---
### Description 🟡
The adaptor responds to events by calling an HTTP REST service. The event mappings determine if that service should return an event and what to do in the case of an error.


#### Event Map 🟠
The adaptor.yaml file contains a config map listing event to service mappings, but it is getting more complex and so needs some documentation.

The structure is:
```
input event | service | output event | error event
```

Example
```
order.submitted.1|contexts-orders.order.validate|order.validated.1|order.invalid.1
order.invalid.1|+api.order|-|-
```


#### Process 🟠
Upon receiving an event, the adaptor looks it up in the event map and passes the event onto the named service. If an output event is specified then a success return status will cause the adaptor to push the returned object onto the bus as an event of the specified output type. If an error status is returned then the return value will be pushed onto the bus as an event of the specified error type.

#### Protocol 🟠
All calls to the service are made using an http post method, unless the service starts with a plus sign (+) in which case we use an http put instead. A dash (-) may only in either or both of the last two positions. A dash in the return event indicates that there is no return event, and a dash in the exception event indicates that there is no exception event.
