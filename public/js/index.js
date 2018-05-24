$().ready(function(){
	$('.navs_btn').click(function(){
		$(this).toggleClass('active');
		$('.navs').toggleClass('active');
	});
	$('.header .shop-nav').click(function(){
		$(this).toggleClass('active');
	})
})