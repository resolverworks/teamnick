import { ponder } from '@/generated'

ponder.on('TeamNick:Registered', async ({ context, event }) => {
  const { Name } = context.entities
  const { node, name, owner, ethAddress, avatar } = event.params

  await Name.create({
    id: node,
    data: {
      name,
      owner,
      ethAddress,
      avatar,
    },
  })
})

ponder.on('TeamNick:RecordsUpdated', async ({ context, event }) => {
  const { Name } = context.entities
  const { node, ethAddress, avatar } = event.params

  await Name.update({
    id: node,
    data: {
      ethAddress,
      avatar,
    },
  })
})
