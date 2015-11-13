TradeCenterScript: ; 4fd10 (13:7d10)
	call EnableAutoTextBoxDrawing
	ld a, [$ffaa]
	cp $2
	ld a, SPRITE_FACING_LEFT
	jr z, .next
	ld a, SPRITE_FACING_RIGHT
.next
	ld [hSpriteFacingDirection], a
	ld a, $1
	ld [H_SPRITEINDEX], a
	call SetSpriteFacingDirection
	ld hl, wd72d
	bit 0, [hl]
	set 0, [hl]
	ret nz
	ld hl, wSpriteStateData2 + $14
	ld a, $8
	ld [hli], a
	ld a, $a
	ld [hl], a
	ld a, SPRITE_FACING_LEFT
	ld [wSpriteStateData1 + $19], a
	ld a, [$ffaa]
	cp $2
	ret z
	ld a, $7
	ld [wSpriteStateData2 + $15], a
	ld a, SPRITE_FACING_RIGHT
	ld [wSpriteStateData1 + $19], a
	ret

TradeCenterTextPointers: ; 4fd4c (13:7d4c)
	dw TradeCenterText1

TradeCenterText1: ; 4fd4e (13:7d4e)
	TX_FAR _TradeCenterText1
	db "@"
