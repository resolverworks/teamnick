import { ponder } from '@/generated'

ponder.on('TeamNick:Registered', async ({ context, event }) => {
  const { Profile } = context.entities
  const { node, name, owner, addr, avatar } = event.params
  const registeredAt = event.block.timestamp

  await Profile.create({
    id: node,
    data: {
      label: name,
      name: name + '.teamnick.eth',
      address: addr,
      avatar,
      owner,
      registeredAt,
    },
  })
})

ponder.on('TeamNick:AddressChanged', async ({ context, event }) => {
  const { Profile } = context.entities
  const { node, addr } = event.params

  await Profile.update({
    id: node,
    data: {
      address: addr,
    },
  })
})

ponder.on('TeamNick:AvatarChanged', async ({ context, event }) => {
  const { Profile } = context.entities
  const { node, avatar } = event.params

  await Profile.update({
    id: node,
    data: {
      avatar,
    },
  })
})

ponder.on('TeamNick:Transfer', async ({ context, event }) => {
  const { Profile } = context.entities
  const { tokenId, to } = event.params

  try {
    await Profile.update({
      id: tokenId,
      data: {
        owner: to,
      },
    })
  } catch {
    // If the update fails, the profile doesn't yet exist in the database which means it's a registration
    // We can ignore the Transfer event in this case because it is covered by the `TeamNick:Registered` handler
  }
})
