#!/bin/bash

id=$(uuid)
echo "Using ID=$id"

generate_post_data()
{
  cat <<EOF
 {
   "ctx": "$id",
   "customerId": "$id",
   "po": "$id",
   "address": "dummy",
   "deliverDate": "01/01/2022",
   "price": "100.00",
   "currency": "USD",
   "username": "bryan@bryan.com",
   "items": [
       {"name": "Pen (blue)", "quantity": 1, "price":"25"},
       {"name": "Pinapple", "quantity": 1, "price":"25"},
       {"name": "Apple", "quantity": 1, "price":"25"},
       {"name": "Pen (black)", "quantity": 1, "price":"25"}
   ]
}
EOF
}

echo "Posting: $(generate_post_data)"

curl -Ls -X POST -H "Content-Type: application/json" --data "$(generate_post_data)" https://bryandollery-chaos-engineers-event-sourcing-wqx5wp6f9w5g-30000.githubpreview.dev/orders