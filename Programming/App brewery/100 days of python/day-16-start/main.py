# # import another_module
# # print(another_module.another_variable)
#
# from turtle import Turtle, Screen
# timmy =  Turtle()
# print(timmy)
# timmy.shape('turtle')
# timmy.color('DeepPink1')
# timmy.forward(100)
# my_screen = Screen()
# print(my_screen.canvheight)
# my_screen.exitonclick()


from prettytable import PrettyTable
table = PrettyTable()
table.add_column("Pokemon Name", ["Pikachu", "Squirtle", "Charmander"])
table.add_column("Type", ["Electric", "Water", "Fire"])
table.align = "l"
print(table)

# import turtle
# #cLcoding.com
# colors=["red", "purple", "blue", "green", "orange", "yellow"]
# # colors=["orange", "blue", "red"]
# t = turtle.Pen()
# turtle.bgcolor("black")
# t.speed(0)
# for x in range(360):
#     t.pencolor(colors[x%6])
#     t.width(x//100+1)
#     t.forward(x)
#     t.left(59)


