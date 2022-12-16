function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method: 'get',
        success:(response)=>{
           if(response.status){
            Swal.fire({
                icon: 'success',
                title: 'Added Successfully',
                text: ' Item Successfully added to cart',
               
            })
                    let count=$('#cart-count').html()
                    count=parseInt(count)+1
                    $("#cart-count").html(count)
           }
           
            
            else{
                console.log("hai")
                location.href='/login'
            }
           
        }
    })
}